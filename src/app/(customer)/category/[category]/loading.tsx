import React from 'react'
import Image from 'next/image'
const index = () => {
  return (
    <div className='h-[100vh] flex items-center justify-center'>
        <Image src="/loading.gif" alt='gif' height={200} width={200}/>
    </div>
  )
}

export default index
