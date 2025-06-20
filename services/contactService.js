const { Op } = require('sequelize');
const { Contact } = require('../models');

class ContactService {
  async identifyContact(phoneNumber, email) {
    if (!phoneNumber && !email) {
      throw new Error('Either phoneNumber or email must be provided');
    }

    const matchingContacts = await this.findMatchingContacts(phoneNumber, email);
    
    if (matchingContacts.length === 0) {
      return this.handleNewContact(phoneNumber, email);
    }

    const primaryContact = this.determinePrimaryContact(matchingContacts);
    
    let allLinkedContacts = await this.findAllLinkedContacts(primaryContact.id);
    
    const contactsToMerge = matchingContacts.filter(
      c => c.linkPrecedence === 'primary' && c.id !== primaryContact.id
    );
    
    if (contactsToMerge.length > 0) {
      await this.mergeContacts(primaryContact, contactsToMerge);
      allLinkedContacts = await this.findAllLinkedContacts(primaryContact.id);
    }

    const shouldCreateSecondary = this.shouldCreateSecondary(
      allLinkedContacts, phoneNumber, email
    );
    
    if (shouldCreateSecondary) {
      await this.createSecondaryContact(primaryContact.id, phoneNumber, email);
      // Refresh linked contacts after creation
      allLinkedContacts = await this.findAllLinkedContacts(primaryContact.id);
    }

    return this.buildResponse(allLinkedContacts);
  }

  async findMatchingContacts(phoneNumber, email) {
    const whereConditions = [];
    
    if (phoneNumber) {
      whereConditions.push({ phoneNumber });
    }
    if (email) {
      whereConditions.push({ email });
    }
    
    return await Contact.findAll({
      where: {
        [Op.or]: whereConditions,
        deletedAt: null
      },
      order: [['createdAt', 'ASC']]
    });
  }

  async findAllLinkedContacts(primaryId) {
    return await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryId },
          { linkedId: primaryId }
        ],
        deletedAt: null
      },
      order: [['createdAt', 'ASC']]
    });
  }

  determinePrimaryContact(contacts) {
    return contacts.find(c => c.linkPrecedence === 'primary') || contacts[0];
  }

  async mergeContacts(primaryContact, contactsToMerge) {
    for (const contact of contactsToMerge) {
      if (contact.id === primaryContact.id) continue;
      
      if (contact.linkPrecedence === 'primary') {
        await contact.update({
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id
        });
      }
      
      await Contact.update(
        { linkedId: primaryContact.id },
        { 
          where: { 
            linkedId: contact.id,
            deletedAt: null
          }
        }
      );
    }
  }

  shouldCreateSecondary(linkedContacts, phoneNumber, email) {
    const hasNewPhone = phoneNumber && !linkedContacts.some(
      c => c.phoneNumber === phoneNumber
    );
    
    const hasNewEmail = email && !linkedContacts.some(
      c => c.email === email
    );
    
    return hasNewPhone || hasNewEmail;
  }

  async createSecondaryContact(primaryId, phoneNumber, email) {
    return await Contact.create({
      phoneNumber,
      email,
      linkedId: primaryId,
      linkPrecedence: 'secondary'
    });
  }

  async handleNewContact(phoneNumber, email) {
    const newContact = await Contact.create({
      phoneNumber,
      email,
      linkPrecedence: 'primary'
    });
    
    return {
      contact: {
        primaryContactId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: []
      }
    };
  }

  buildResponse(linkedContacts) {
    const primaryContact = linkedContacts.find(c => c.linkPrecedence === 'primary');
    const secondaryContacts = linkedContacts.filter(c => c.id !== primaryContact.id);
    
    const emails = [primaryContact.email];
    secondaryContacts.forEach(c => {
      if (c.email && !emails.includes(c.email)) {
        emails.push(c.email);
      }
    });
    
    const phoneNumbers = [primaryContact.phoneNumber];
    secondaryContacts.forEach(c => {
      if (c.phoneNumber && !phoneNumbers.includes(c.phoneNumber)) {
        phoneNumbers.push(c.phoneNumber);
      }
    });
    
    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: emails.filter(Boolean),
        phoneNumbers: phoneNumbers.filter(Boolean),
        secondaryContactIds: secondaryContacts.map(c => c.id)
      }
    };
  }
}

module.exports = new ContactService();