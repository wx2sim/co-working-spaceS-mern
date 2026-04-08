import React from 'react'
import { Button, Popconfirm } from 'antd';

function PopConfirm() {
 
  return (
    <Popconfirm
      title="Title"
      description="Delete Account"
      onConfirm={confirm}
      onOpenChange={() => console.log('open change')}
    >
      <Button type="primary">Delete Account</Button>
    </Popconfirm>
  );
  
}

export  default PopConfirm;


