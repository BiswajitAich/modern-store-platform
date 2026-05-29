"use client";
import styles from "./ProfileEditPage.module.css";
import Image from "next/image";
import { EditUserData, ErrorFormState } from "@/app/_lib/types";
import { useState, useEffect, useActionState } from "react";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";
import { updateProfileAction } from "../actions";

interface UserProps {
  userData: EditUserData;
}

const ProfileEditForm = ({ userData }: UserProps) => {
  // const [imageFile, setImageFile] = useState<File | null>(null);

  const [state, action] = useActionState<ErrorFormState, FormData>(
    updateProfileAction,
    {
      error: null,
      timestamp: "",
    }
  );
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.timestamp]);

  return (
    <form action={action} className={styles.form}>
      <Edit userData={userData} />
    </form>
  );
};

export default ProfileEditForm;

const Edit = ({ userData }: UserProps) => {
  const { pending } = useFormStatus();
  const [imageFileChanged, setImageFileChanged] = useState<boolean>(false);

  type FormState = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };

  const [form, setForm] = useState<FormState>({
    firstName: userData.firstName ?? "",
    lastName: userData.lastName ?? "",
    phoneNumber: userData.phoneNumber ?? "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    userData.profileImage ?? null
  );
  const getInitials = () => {
    const first = form.firstName?.[0] || "";
    const last = form.lastName?.[0] || "";
    return (first + last).toString().toUpperCase() || "U";
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Image size should be less than 1MB");
        return;
      }

      // setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFileChanged(true);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: userData.firstName ?? "",
      lastName: userData.lastName ?? "",
      phoneNumber: userData.phoneNumber ?? "",
    });
    setImagePreview(userData.profileImage ?? null);
    // setImageFile(null);
    setImageFileChanged(false);
  };
  const isDirty =
    form.firstName !== (userData.firstName ?? "") ||
    form.lastName !== (userData.lastName ?? "") ||
    form.phoneNumber !== (userData.phoneNumber ?? "") ||
    imageFileChanged;
  return (
    <>
      {/* Image Upload Section */}
      <div className={styles.imageSection}>
        <div className={styles.imagePreviewContainer}>
          {imagePreview ? (
            (() => {
              const isCloudinaryPublicId =
                !imagePreview.startsWith("blob:") &&
                !imagePreview.startsWith("http");
              return (
                <Image
                  src={
                    isCloudinaryPublicId
                      ? `/api/image?imageId=${encodeURIComponent(imagePreview)}`
                      : imagePreview
                  }
                  alt="Profile preview"
                  fill
                  className={styles.imagePreview}
                  priority
                />
              );
            })()
          ) : (
            <div className={styles.imagePlaceholder}>{getInitials()}</div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.imageUploadInput}
          id="profileImage"
          name="profileImage"
          disabled={pending}
        />

        <label
          htmlFor="profileImage"
          className={styles.imageUploadLabel}
        // onClick={handleImageClick}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          {imageFileChanged ? "Change Photo" : "Upload Photo"}
        </label>

        <p className={styles.imageInfo}>JPG, PNG or GIF • Max 1MB</p>
      </div>

      {/* Form Fields */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>
            First Name <span className={styles.required}>*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            className={styles.input}
            value={form.firstName ?? ""}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="Enter first name"
            required
            disabled={pending}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name <span className={styles.required}>*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            className={styles.input}
            value={form.lastName ?? ""}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="Enter last name"
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phoneNumber" className={styles.label}>
          Phone Number <span className={styles.required}>*</span>
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          className={styles.input}
          value={form.phoneNumber ?? ""}
          onChange={(e) =>
            setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, "") })
          }
          placeholder="+91 (555) 000-0000"
          minLength={10}
          maxLength={10}
          disabled={pending}
        />
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={handleCancel}
          disabled={!isDirty || pending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary} ${pending ? styles.loading : ""
            }`}
          disabled={!isDirty || pending}
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <input type="hidden" name="userId" value={userData.id} />
      <input
        type="hidden"
        name="imageFileChanged"
        value={imageFileChanged ? "true" : "false"}
      />
      <input
        type="hidden"
        name="previousImageId"
        value={userData.profileImage ?? ""}
      />
    </>
  );
};
