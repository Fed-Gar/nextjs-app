'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// Use Zod to update the expected types
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// Create
export async function createInvoice(formData: FormData) {
  // Extract data and validate types
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Query
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  // Clear the client cache and make a new server request
  revalidatePath('/dashboard/invoices');
  // Redirect the user to the invoice's page
  redirect('/dashboard/invoices');
};

// Update
export async function updateInvoice(id: string, formData: FormData) {
  // Extract data and validate types
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
  
  // Query
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  
  // Clear the client cache and make a new server request
  revalidatePath('/dashboard/invoices');
  // Redirect the user to the invoice's page
  redirect('/dashboard/invoices');
};

// Delete
export async function deleteInvoice(id: string) {
  // Query
  await sql`DELETE FROM invoices WHERE id = ${id}`;

  // Clear the client cache and make a new server request
  revalidatePath('/dashboard/invoices');
};