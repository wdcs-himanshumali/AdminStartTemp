// MUI Imports
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

// Third Party Imports
import type { useReactTable } from '@tanstack/react-table'

interface TablePaginationComponentProps {
  table: ReturnType<typeof useReactTable>
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
}

const TablePaginationComponent = ({ total, page, limit, onPageChange }: TablePaginationComponentProps) => {
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography color='text.disabled'>{`Showing ${start} to ${end} of ${total} entries`}</Typography>
      <Pagination
        shape='rounded'
        color='primary'
        variant='tonal'
        count={Math.ceil(total / limit)}
        page={page}
        onChange={(_, newPage) => {
          onPageChange(newPage)
        }}
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default TablePaginationComponent
