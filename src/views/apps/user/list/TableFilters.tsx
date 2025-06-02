// React Imports
import { useState } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'

// Type Imports
import type { User, UsersQueryParams } from '@/services/api'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import { useRoles } from '@/services/api'

interface TableFiltersProps {
  setData: (data: User[]) => void
  tableData?: User[]
  onFilterChange: (filters: Partial<UsersQueryParams>) => void
}

const TableFilters = ({ onFilterChange }: TableFiltersProps) => {
  // States
  const [role, setRole] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  // API Hooks
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles()

  const handleRoleChange = (value: string) => {
    setRole(value)
    onFilterChange({ role_id: value ? Number(value) : undefined })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFilterChange({ status: value || undefined })
  }

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            id='select-role'
            value={role}
            onChange={e => handleRoleChange(e.target.value)}
            disabled={isLoadingRoles}
            placeholder='Select Role'
            slotProps={{
              select: {
                displayEmpty: true,
                renderValue: selected => {
                  if (!selected) return 'Select Role'

                  return rolesData?.data?.find(r => r.id === Number(selected))?.name || 'Select Role'
                }
              },
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
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => handleStatusChange(e.target.value)}
            placeholder='Select Status'
            slotProps={{
              select: {
                displayEmpty: true,
                renderValue: (selected: unknown) => {
                  if (!selected) return 'Select Status'

                  return selected as string
                }
              },
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-user-check' />
                  </InputAdornment>
                )
              }
            }}
          >
            <MenuItem value='ACTIVE'>Active</MenuItem>
            <MenuItem value='INACTIVE'>Inactive</MenuItem>
            <MenuItem value='DELETED'>Deleted</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
