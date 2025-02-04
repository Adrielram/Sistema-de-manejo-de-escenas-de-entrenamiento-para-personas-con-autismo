import React from 'react';
import NotificationPage from './page.client';
import { getTokenFromCookies } from '../../../../utils/cookies';

export default async function Page() {
  const token = await getTokenFromCookies();
  return <NotificationPage token={token} />;
}
