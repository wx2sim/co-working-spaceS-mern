import React from 'react';
import { Button, Popconfirm } from 'antd';

export default function SmartButton({ 
  actionFunction, 
  colorClass, 
  text, 
  showAlert,
  alertTitle = "Alert",
  alertDescription = "Are you sure you want to proceed?" 
}) {

  const buttonElement = (
    <Button 
      className={`${colorClass} text-white border-none`} 
      type="primary"
      onClick={!showAlert ? actionFunction : undefined}
    >
      {text}
    </Button>
  );

  if (showAlert) {
    return (
      <Popconfirm
        title={alertTitle}
        description={alertDescription}
        okButtonProps={{ danger: true }}
        onConfirm={actionFunction} 
      >
        {buttonElement}
      </Popconfirm>
    );
  }
  return buttonElement;
}