'use server'

import { createSession, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    await createSession()
    redirect('/admin')
  }

  return { error: 'Credenciales incorrectas' }
}

export async function logoutAction() {
  await deleteSession()
  redirect('/admin/login')
}
