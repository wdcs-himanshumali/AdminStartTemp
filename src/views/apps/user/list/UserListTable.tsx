'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { User, UsersQueryParams } from '@/services/api'

// import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Imports
import { useDeleteUser } from '@/services/api'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UserWithAction = User & {
  action?: string
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)
  const [isInitialMount, setIsInitialMount] = useState(true)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    // Skip the initial mount effect
    if (isInitialMount) {
      setIsInitialMount(false)

      return
    }

    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Vars
const userRoleObj: Record<string, { icon: string; color: ThemeColor }> = {
  Admin: { icon: 'tabler-crown', color: 'error' },
  'Super User': { icon: 'tabler-device-desktop', color: 'warning' },
  Editor: { icon: 'tabler-edit', color: 'info' },
  Maintainer: { icon: 'tabler-chart-pie', color: 'success' },
  Subscriber: { icon: 'tabler-user', color: 'primary' },
  Unknown: { icon: 'tabler-user-question', color: 'secondary' }
}

const userStatusObj: Record<string, ThemeColor> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DELETED: 'error'
}

// Column Definitions
const columnHelper = createColumnHelper<UserWithAction>()

interface UserListTableProps {
  tableData?: User[]
  total?: number
  page?: number
  limit?: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onSearch: (search: string) => void
  onFilterChange: (filters: Partial<UsersQueryParams>) => void
  filters?: {
    role_id?: number
    status?: string
  }
}

const UserListTable = ({
  tableData,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onLimitChange,
  onSearch,
  onFilterChange,
  filters
}: UserListTableProps) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(tableData)
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  // Hooks
  const router = useRouter()
  const deleteUser = useDeleteUser()

  // Memoize the data update function
  const updateData = useCallback((newData: User[] | undefined) => {
    setData(newData)
    setFilteredData(newData)
  }, [])

  useEffect(() => {
    if (tableData) {
      updateData(tableData)
    }
  }, [tableData, updateData])

  // Memoize the search handler
  const handleSearch = useCallback(
    (value: string) => {
      setGlobalFilter(value)

      // Only trigger search API call if there is actual search text
      if (value.trim()) {
        onSearch(value)
      } else {
        // If search is empty, reset to initial state without search parameter
        onSearch('')
      }
    },
    [onSearch]
  )

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await deleteUser.mutateAsync(userToDelete)
        setData(data?.filter(user => user.id !== userToDelete))
        setDeleteDialogOpen(false)
        setUserToDelete(null)
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const columns = useMemo<ColumnDef<UserWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('name', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {getAvatar({ name: row.original.name })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Icon
              className={userRoleObj[row.original.role?.name || 'Unknown']?.icon || 'tabler-user-question'}
              sx={{
                color: `var(--mui-palette-${userRoleObj[row.original.role?.name || 'Unknown']?.color || 'secondary'}-main)`
              }}
            />
            <Typography className='capitalize' color='text.primary'>
              {row.original.role?.name || 'Unknown'}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original.email}
          </Typography>
        )
      }),
      columnHelper.accessor('phone_number', {
        header: 'Phone Number',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original.phone_number}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original.status}
              size='small'
              color={userStatusObj[row.original.status] || 'secondary'}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleDeleteClick(row.original.id)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
            <IconButton>
              <Link href={`/user/view/${row.original.id}`} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Download',
                  icon: 'tabler-download',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                },
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => router.push(`/user/edit/${row.original.id}`)
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = (params: { name: string }) => {
    const { name } = params

    return <CustomAvatar size={34}>{getInitials(name)}</CustomAvatar>
  }

  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters
          setData={setFilteredData}
          tableData={data}
          onFilterChange={onFilterChange}
          currentFilters={filters}
        />
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={limit}
            onChange={e => onLimitChange(Number(e.target.value))}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => handleSearch(String(value))}
              placeholder='Search User'
              className='max-sm:is-full'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => router.push('/user/add')}
              className='max-sm:is-full'
            >
              Add New User
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='tabler-chevron-up text-xl' />,
                              desc: <i className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => (
            <TablePaginationComponent
              table={table}
              total={total}
              page={page}
              limit={limit}
              onPageChange={newPage => onPageChange(newPage)}
            />
          )}
          count={total}
          rowsPerPage={limit}
          page={page - 1}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={e => onLimitChange(Number(e.target.value))}
          rowsPerPageOptions={[10, 25, 50]}
          showFirstButton
          showLastButton
        />
      </Card>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained' disabled={deleteUser.isPending}>
            {deleteUser.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserListTable
