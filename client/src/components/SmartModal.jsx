import React, { useState } from 'react';
import { Button, Modal } from 'antd';

export default function SmartModal({
  triggerText = "Open Modal",
  triggerColorClass = "bg-blue-500 hover:bg-blue-600 text-white ",
  modalTitle = "Modal Title",
  modalContent = "Default modal content goes here.",
  modalBgColor = "#ffffff", // white
  okText = "Confirm",
  okColorClass = "bg-slate-700 hover:bg-slate-800 text-white",
  cancelText = "Cancel",
  cancelColorClass = "bg-white text-gray-700 border-gray-300",
  onOkAction,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleOk = async () => {
    if (onOkAction) {
      await onOkAction();
    }
    setIsModalOpen(false);
  };
  const customFooter = (
    <div className="flex justify-end gap-2 mt-4">
      <Button className={cancelColorClass} onClick={handleCancel}>
        {cancelText}
      </Button>
      <Button className={`${okColorClass} border-none`} onClick={handleOk}>
        {okText}
      </Button>
    </div>
  );

  return (
    <>
      <Button className={`${triggerColorClass} border-none`} onClick={showModal}>
        {triggerText}
      </Button>
      <Modal
        title={modalTitle}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={customFooter}
        centered
        mask={{ enabled: true, blur: true }}
        styles={{
          content: { backgroundColor: modalBgColor },
          header: { backgroundColor: modalBgColor },
        }}
      >
        <div className="py-4 text-base">
          {modalContent}
        </div>
      </Modal>
    </>
  );
}