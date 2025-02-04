import React from 'react'
import PacientesPage from './page.client'
import { getTokenFromCookies } from '../../../utils/cookies'

const page = async () => {
  const token = await getTokenFromCookies();
  return (
    <PacientesPage token={token} />
  )
}

export default page