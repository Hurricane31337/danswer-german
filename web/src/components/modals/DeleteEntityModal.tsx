import { FiTrash, FiX } from "react-icons/fi";
import { BasicClickable } from "@/components/BasicClickable";
import { Modal } from "../Modal";

export const DeleteEntityModal = ({
  onClose,
  onSubmit,
  entityType,
  entityName,
  additionalDetails,
}: {
  entityType: string;
  entityName: string;
  onClose: () => void;
  onSubmit: () => void;
  additionalDetails?: string;
}) => {
  return (
    <Modal onOutsideClick={onClose}>
      <>
        <div className="flex mb-4">
          <h2 className="my-auto text-2xl font-bold">{entityType.charAt(0).toUpperCase() + entityType.slice(1)} löschen?</h2>
        </div>
        <p className="mb-4">
          Klicke unten, um zu bestätigen, dass du{" "}
          <b>&quot;{entityName}&quot; löschen möchtest.</b>
        </p>
        {additionalDetails && <p className="mb-4">{additionalDetails}</p>}
        <div className="flex">
          <div className="mx-auto">
            <BasicClickable onClick={onSubmit}>
              <div className="flex mx-2">
                <FiTrash className="my-auto mr-2" />
                Löschen
              </div>
            </BasicClickable>
          </div>
        </div>
      </>
    </Modal>
  );
};
