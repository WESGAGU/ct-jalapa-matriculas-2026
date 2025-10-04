"use client";

import { X } from "lucide-react";
import { FormControl } from "./form";
import { Input } from "./input";
import Image from "next/image";
import { useId, useEffect, useState, type ElementType } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// A narrow type for the controller field used by this component.
// We only need the properties we actually use (value and onChange),
// which avoids using `any` and satisfies the linter rule.
interface ImageField {
    value: File | string | null | undefined;
    onChange: (value: File | string | null) => void;
    onBlur?: () => void;
    name?: string;
    ref?: unknown;
}

interface ImageDropzoneProps {
    field: ImageField;
    icon: ElementType;
    label: string;
}

export function ImageDropzone({ field, icon: Icon, label }: ImageDropzoneProps) {
    const id = useId();
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        const fileOrUrl = field.value;
        let newPreview: string | null = null;
        if (typeof fileOrUrl === 'string') {
            newPreview = fileOrUrl;
        } else if (fileOrUrl instanceof File) {
            newPreview = URL.createObjectURL(fileOrUrl);
        }
        setPreview(newPreview);
        
        return () => {
            if (newPreview && newPreview.startsWith('blob:')) {
                URL.revokeObjectURL(newPreview);
            }
        };

    }, [field.value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            field.onChange(file);
        }
        e.target.value = ''; // Reset input
    };
    
    const handleRemoveImage = () => {
       field.onChange(null);
    };

    const hasPreview = !!preview;
    
    const renderDropzoneContent = () => (
         <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center h-full">
            <Icon className="w-8 h-8 mb-4 text-muted-foreground" aria-hidden="true" />
            <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Haz clic para subir</span>
            </p>
             <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );

    const renderImagePreview = (previewUrl: string) => (
        <div className="relative w-full h-full flex items-center justify-center bg-muted/30 rounded-lg">
            <Image src={previewUrl} alt="Previsualización" fill style={{ objectFit: "contain" }} className="rounded-lg p-1" />
             <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 z-10"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveImage();
                }}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Eliminar imagen</span>
            </Button>
       </div>
    );
    
    return (
        <div className="flex items-center justify-center w-full">
            <label
                htmlFor={id}
                className={cn(
                    "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 border-input transition-colors",
                     hasPreview && 'p-2'
                )}
            >
                {hasPreview ? (
                    renderImagePreview(preview as string)
                ) : (
                    renderDropzoneContent()
                )}
                <FormControl>
                    <Input
                        id={id}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </FormControl>
            </label>
        </div>
    );
}