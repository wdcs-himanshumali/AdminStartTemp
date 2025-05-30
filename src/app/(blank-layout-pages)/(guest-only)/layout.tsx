// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType

const Layout = async ({ children }: Props) => {
  const systemMode = await getSystemMode()
  const defaultDirection = 'ltr' // Set to 'rtl' if needed

  return (
    <Providers direction={defaultDirection}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
