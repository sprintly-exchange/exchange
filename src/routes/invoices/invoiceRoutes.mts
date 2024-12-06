import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';  // Import Multer for handling file uploads
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { CommonFunctions } from '../../api/models/CommonFunctions.mjs';

// Initialize router
const invoiceRoutes = Router();

// Set up storage for Multer (optional, you can specify destination and filename for uploaded files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '');  // Set the folder where files should be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Name the file uniquely (e.g., timestamp + original name)
  },
});

// Initialize Multer middleware for handling single file upload
const upload = multer({ storage: storage });

// Swagger API documentation

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: APIs for invoice processing and status tracking
 */

/**
 * @swagger
 * /api/invoice:
 *   post:
 *     summary: Upload a new invoice
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *             example:
 *               file: "invoice.xml"
 *     responses:
 *       '201':
 *         description: Invoice uploaded successfully
 */

// POST route to handle invoice upload
invoiceRoutes.post('/', upload.single('file'), (req, res) => {
    try {
        CommonFunctions.logWithTimestamp('Invoice upload received');
        setCommonHeaders(res);

        // Log received data for debugging purposes
        console.log('Received body:', req.body);
        console.log('Received file:', req.file);

        // Check if a file was uploaded
        if (!req.file) {
            res.status(400).send('No file uploaded');
            return; // Ensure the handler ends here
        }

        // Generate a unique ID for the invoice
        const invoiceId = uuidv4();
        const invoiceData = {
            id: invoiceId,
            fileName: req.file.originalname, // Use the uploaded file's original name
            status: 'Pending', // Set the initial status to Pending
            uploadedAt: new Date().toISOString(), // Store the upload timestamp
        };

        // Store the invoice in memory (or in a database, in real applications)
        GlobalConfiguration.configurationInvoiceMap.set(invoiceId, invoiceData);

        // Send a success response
        res.status(201).send(
            JSON.stringify(new ResponseMessage(invoiceId, 'Invoice uploaded successfully', ''))
        );
    } catch (error) {
        // Handle unexpected errors
        console.error('Error handling invoice upload:', error);
        res.status(500).send('Internal server error');
    }
});


/**
 * @swagger
 * /api/invoice/{id}:
 *   get:
 *     summary: Get invoice details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the invoice to retrieve
 *     responses:
 *       '200':
 *         description: Successful response with invoice details
 *       '204':
 *         description: Invoice not found
 */

// GET route to retrieve invoice details by ID
invoiceRoutes.get('/:id', function (req, res) {
    CommonFunctions.logWithTimestamp(`Invoice details requested for id: ${req.params.id}`);
    setCommonHeaders(res);

    // Fetch invoice by ID
    const invoice = GlobalConfiguration.configurationInvoiceMap.get(req.params.id);
    if (invoice) {
        res.status(200).send(JSON.stringify(invoice));
    } else {
        res.status(204).send('{}');
    }
});

/**
 * @swagger
 * /api/invoice:
 *   get:
 *     summary: Get all invoices with statuses
 *     responses:
 *       '200':
 *         description: Successful response with list of invoices
 */

// GET route to retrieve all invoices
invoiceRoutes.get('/', function (req, res) {
    CommonFunctions.logWithTimestamp('All invoices requested');
    setCommonHeaders(res);

    // Get all invoices from the map
    const invoices = Array.from(GlobalConfiguration.configurationInvoiceMap.values());
    if (invoices.length > 0) {
        res.status(200).send(invoices);
    } else {
        res.status(204).send('No invoices found');
    }
});

/**
 * @swagger
 * /api/invoice:
 *   put:
 *     summary: Update the status of an existing invoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               status:
 *                 type: string
 *             example:
 *               id: "12345"
 *               status: "Sent"
 *     responses:
 *       '200':
 *         description: Invoice status updated successfully
 *       '400':
 *         description: Invalid data or invoice not found
 */

// PUT route to update invoice status
invoiceRoutes.put('/', function (req, res) {
    CommonFunctions.logWithTimestamp(`Invoice status update request received: ${JSON.stringify(req.body)}`);
    setCommonHeaders(res);

    const { id, status } = req.body;

    if (!id || !status) {
        res.status(400).send('Missing required fields');
        return;
    }

    const invoice = GlobalConfiguration.configurationInvoiceMap.get(id);
    if (invoice) {
        invoice.status = status;  // Update the invoice status
        res.status(200).send(JSON.stringify(new ResponseMessage(id, 'Invoice status updated successfully', '')));
    } else {
        res.status(400).send('Invoice not found');
    }
});

/**
 * @swagger
 * /api/invoice/{id}:
 *   delete:
 *     summary: Delete an invoice by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the invoice to delete
 *     responses:
 *       '204':
 *         description: Invoice deleted successfully
 *       '400':
 *         description: Invoice not found or unable to delete
 */

// DELETE route to remove an invoice by ID
invoiceRoutes.delete('/:id', function (req, res) {
    CommonFunctions.logWithTimestamp(`Invoice deletion requested for id: ${req.params.id}`);
    setCommonHeaders(res);

    const invoice = GlobalConfiguration.configurationInvoiceMap.get(req.params.id);
    if (invoice) {
        GlobalConfiguration.configurationInvoiceMap.delete(req.params.id);  // Delete the invoice
        res.status(204).send('');
    } else {
        res.status(400).send('Invoice not found');
    }
});

export default invoiceRoutes;
