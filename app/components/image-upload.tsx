"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImage } from "../actions/upload-image";

// Helper function to set a cookie
function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

interface ImageUploadProps {
  initialUserName?: string;
}

export default function ImageUpload({ initialUserName }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [userName, setUserName] = useState<string>(initialUserName || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUserName(newName);
    setCookie("rotfest-user-name", newName, 30); // Save for 30 days
  };

  const handleSubmit = async (formData: FormData) => {
    setIsUploading(true);
    setMessage(null);

    try {
      const result = await uploadImage(formData);

      if (result.success) {
        setMessage({ type: "success", text: "Bilde lastet opp og behandlet!" });
        setPreviewUrl(null);
        formRef.current?.reset();
        setUserName((formData.get("userName") as string) || "");
      } else {
        setMessage({ type: "error", text: `Feil: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Feil: ${(error as Error).message}` });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Last opp bilde til Rotfest
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleSubmit(formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="userName">Ditt navn (valgfritt)</Label>
            <Input
              id="userName"
              name="userName"
              placeholder="Skriv navnet ditt her"
              value={userName}
              onChange={handleNameChange}
            />
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              required
            />

            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              {previewUrl ? (
                <div className="relative w-full">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-contain rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={triggerFileInput}
                  >
                    Endre
                  </Button>
                </div>
              ) : (
                <>
                  <Camera className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Klikk for å velge et bilde
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    eller dra og slipp
                  </p>
                </>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isUploading || !previewUrl}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Husker minner...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Last opp bilde
              </>
            )}
          </Button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-center text-gray-500 flex justify-center">
        <p>
          Bildet vil bli behandlet med AI for å legge til nasjonalromantiske
          elementer
        </p>
      </CardFooter>
    </Card>
  );
}
