import React from 'react'

export default async function patients({ params }: { params: Promise<{ group_id: string }> }) {
  const { group_id } = await params;
  return (
    <>
      <h1 className="text-black">Group ID:{group_id}</h1>
    </>
  )
}
