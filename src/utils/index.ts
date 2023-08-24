import express, { Router } from "express";
export { isValidEmail, isValidPhoneNumber } from "./validate";
export { createContactsTable, getLinkedContacts } from "./contacts";
export const routes: Router = express.Router();
