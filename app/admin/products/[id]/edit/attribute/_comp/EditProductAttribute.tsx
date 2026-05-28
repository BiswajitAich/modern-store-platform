"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";

import styles from "../../../../../styles/New.module.css";

import { ErrorFormState } from "@/app/_lib/types";
import { updateProductAttribute } from "./action";

interface AttributeData {
  id: number;
  productId: number;
  productName: string;
  key: string;
  value: string;
  displayOrder: number;
}

export default function EditProductAttribute({
  attribute,
}: {
  attribute: AttributeData;
}) {
  const [state, action] = useActionState<
    ErrorFormState,
    FormData
  >(updateProductAttribute, {
    error: undefined,
    timestamp: "",
  });

  const [formData, setFormData] = useState({
    key: attribute.key,
    value: attribute.value,
    displayOrder: attribute.displayOrder.toString(),
  });

  const initialData = useMemo(
    () => ({
      key: attribute.key,
      value: attribute.value,
      displayOrder: attribute.displayOrder.toString(),
    }),
    [attribute],
  );

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.timestamp) {
      toast.success("Attribute updated successfully");
      redirect(`/admin/products/${attribute.productId}/edit`);
    }
  }, [state]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link
          href={`/admin/products/${attribute.productId}`}
          className={styles.backLink}
        >
          ← Back to Product
        </Link>

        <h1 className={styles.title}>Edit Product Attribute</h1>

        <p className={styles.subtitle}>
          Product: {attribute.productName}
        </p>
      </div>

      <div className={styles.formWrapper}>
        <form action={action} className={styles.form}>
          <FormContent
            attribute={attribute}
            formData={formData}
            setFormData={setFormData}
            hasChanges={hasChanges}
          />
        </form>
      </div>
    </div>
  );
}

function FormContent({
  attribute,
  formData,
  setFormData,
  hasChanges,
}: {
  attribute: AttributeData;
  formData: {
    key: string;
    value: string;
    displayOrder: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      key: string;
      value: string;
      displayOrder: string;
    }>
  >;
  hasChanges: boolean;
}) {
  const { pending } = useFormStatus();

  const router = useRouter();

  return (
    <>
      <input
        type="hidden"
        name="attributeId"
        value={attribute.id}
      />

      <input
        type="hidden"
        name="productId"
        value={attribute.productId}
      />

      {/* key */}
      <div className={styles.formGroup}>
        <label htmlFor="key" className={styles.label}>
          Attribute Key <span className={styles.required}>*</span>
        </label>

        <input
          type="text"
          id="key"
          name="key"
          value={formData.key}
          onChange={(e) =>
            setFormData({
              ...formData,
              key: e.target.value,
            })
          }
          className={styles.input}
          placeholder="e.g. material"
          disabled={pending}
          required
        />
      </div>

      {/* value */}
      <div className={styles.formGroup}>
        <label htmlFor="value" className={styles.label}>
          Attribute Value <span className={styles.required}>*</span>
        </label>

        <input
          type="text"
          id="value"
          name="value"
          value={formData.value}
          onChange={(e) =>
            setFormData({
              ...formData,
              value: e.target.value,
            })
          }
          className={styles.input}
          placeholder="e.g. cotton"
          disabled={pending}
          required
        />
      </div>

      {/* display order */}
      <div className={styles.formGroup}>
        <label
          htmlFor="displayOrder"
          className={styles.label}
        >
          Display Order
        </label>

        <input
          type="number"
          id="displayOrder"
          name="displayOrder"
          value={formData.displayOrder}
          onChange={(e) =>
            setFormData({
              ...formData,
              displayOrder: e.target.value,
            })
          }
          className={styles.input}
          min="0"
          disabled={pending}
        />

        <p className={styles.helperText}>
          Lower numbers appear first
        </p>
      </div>

      {/* actions */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={pending}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending || !hasChanges}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {pending
            ? "Updating..."
            : !hasChanges
              ? "No Changes"
              : "Update Attribute"}
        </button>
      </div>
    </>
  );
}