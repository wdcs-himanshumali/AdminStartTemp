'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'

// API Imports
import { useUser, useUpdateUser, useRoles } from '@/services/api'

type FormData = {
  role_id: number
  name: string
  email: string
  phone_number: string
  profile_picture_url: string
  status: string
}

interface EditUserFormProps {
  userId: number
}

const EditUserForm = ({ userId }: EditUserFormProps) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { data: userResponse, isLoading: isLoadingUser } = useUser(userId)
  const updateUser = useUpdateUser()
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      role_id: 1,
      name: '',
      email: '',
      phone_number: '',
      profile_picture_url: '',
      status: 'ACTIVE'
    }
  })

  useEffect(() => {
    if (userResponse?.data) {
      const userData = userResponse.data

      reset({
        role_id: userData.role_id,
        name: userData.name,
        email: userData.email,
        phone_number: userData.phone_number,
        profile_picture_url: userData.profile_picture_url || '',
        status: userData.status
      })
    }
  }, [userResponse, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await updateUser.mutateAsync({ id: userId, data })
      router.push('/user/list')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  if (isLoadingUser) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader title='Edit User' />
      <CardContent>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity='error' sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='role_id'
                control={control}
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Role'
                    error={!!errors.role_id}
                    helperText={errors.role_id?.message}
                    disabled={isLoadingRoles}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-user-circle' />
                          </InputAdornment>
                        )
                      }
                    }}
                  >
                    {rolesData?.data?.length ? (
                      rolesData.data.map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value=''>
                        {isLoadingRoles ? 'Loading roles...' : 'No roles available'}
                      </MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Name'
                    placeholder='John Doe'
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-user' />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='email'
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Email'
                    placeholder='johndoe@gmail.com'
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-mail' />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='phone_number'
                control={control}
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Phone Number'
                    placeholder='+1234567890'
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-phone' />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='profile_picture_url'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Profile Picture URL'
                    placeholder='https://example.com/profile.jpg'
                    error={!!errors.profile_picture_url}
                    helperText={errors.profile_picture_url?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-photo' />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name='status'
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Status'
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value='ACTIVE'>Active</MenuItem>
                    <MenuItem value='INACTIVE'>Inactive</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant='contained' type='submit' disabled={updateUser.isPending}>
                {updateUser.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      </CardContent>
    </Card>
  )
}

export default EditUserForm
