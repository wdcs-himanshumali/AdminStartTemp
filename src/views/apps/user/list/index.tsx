'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports

// Component Imports
import UserListTable from './UserListTable'

// import UserListCards from './UserListCards'

// API Imports
import { useUsers } from '@/services/api'
import type { UsersQueryParams } from '@/services/api'

const UserList = () => {
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 1,
    limit: 10
  })

  const { data: usersResponse, isLoading, error } = useUsers(queryParams)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        {error.message}
      </Alert>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <UserListCards />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <UserListTable
          tableData={usersResponse?.data?.data}
          total={usersResponse?.data?.total}
          page={usersResponse?.data?.page}
          limit={usersResponse?.data?.limit}
          onPageChange={page => setQueryParams(prev => ({ ...prev, page }))}
          onLimitChange={limit => setQueryParams(prev => ({ ...prev, limit, page: 1 }))}
          onSearch={search => setQueryParams(prev => ({ ...prev, search, page: 1 }))}
          onFilterChange={filters => setQueryParams(prev => ({ ...prev, ...filters, page: 1 }))}
        />
      </Grid>
    </Grid>
  )
}

export default UserList
