'use client'

import { use } from 'react'

import EditUserForm from '@/views/forms/edit-user-form/EditUserForm'

const EditUserPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params)

  return <EditUserForm userId={parseInt(resolvedParams.id)} />
}

export default EditUserPage
