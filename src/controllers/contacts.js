import createError from 'http-errors';
import contactsService from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import cloudinary from '../utils/cloudinary.js';

// GET /contacts — sayfalama ile
async function getContacts(req, res, next) {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const totalItems = await contactsService.countContacts(filter);
    const contacts = await contactsService.getAllContacts({
      skip: (page - 1) * perPage,
      limit: perPage,
      sortBy,
      sortOrder,
      filter
    });

    const totalPages = Math.ceil(totalItems / perPage);

    res.status(200).json({
      status: 200,
      message: "Successfully found contacts!",
      data: {
        data: contacts,
        page,
        perPage,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /contacts/:contactId
async function getContactById(req, res, next) {
  try {
    const { contactId } = req.params;

    const contact = await contactsService.getContactById(contactId);

    if (!contact) {
      throw createError(404, "Contact not found");
    }

    res.status(200).json({
      status: 200,
      message: "Successfully found contact!",
      data: contact
    });
  } catch (error) {
    next(error);
  }
}

// POST /contacts
async function createContact(req, res, next) {
  try {
    const { file } = req;

    // Fotoğraf yükleme varsa Cloudinary'e gönder
    if (file) {
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'contacts' },
        (error, result) => {
          if (error) throw error;
          req.body.photo = result.secure_url;
        }
      );
      const stream = result;
      stream.end(file.buffer);
    }

    const newContact = await contactsService.createContact({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({
      message: "Successfully created a contact!",
      data: newContact
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /contacts/:contactId
async function updateContact(req, res, next) {
  try {
    const { contactId } = req.params;
    const { file } = req;

    // Fotoğraf yükleme varsa Cloudinary'e gönder
    if (file) {
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'contacts' },
        (error, result) => {
          if (error) throw error;
          req.body.photo = result.secure_url;
        }
      );
      const stream = result;
      stream.end(file.buffer);
    }

    const contact = await contactsService.updateContact(contactId, req.body);

    if (!contact) {
      throw createError(404, "Contact not found");
    }

    res.status(200).json({
      message: "Successfully patched a contact!",
      data: contact
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /contacts/:contactId
async function deleteContact(req, res, next) {
  try {
    const { contactId } = req.params;

    const deletedContact = await contactsService.deleteContact(contactId);

    if (!deletedContact) {
      throw createError(404, "Contact not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export default {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
  