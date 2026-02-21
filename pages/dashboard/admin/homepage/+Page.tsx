import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { getStoreOwnerId } from "#root/shared/config/store";
import { toast } from "sonner";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Switch } from "#root/components/ui/switch";
import { Textarea } from "#root/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Separator } from "#root/components/ui/separator";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  ValuePropIconType,
  type HomepageContent,
  type ValuePropItem,
} from "#root/shared/types/homepage-content";
import {
  Trash2,
  Plus,
  Save,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Copy,
  X,
  Check,
} from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { Alert, AlertDescription } from "#root/components/ui/alert";

// Predefined route options for hero CTA
const PREDEFINED_ROUTES = [
  { label: "Shop - All Products", value: "/shop" },
  { label: "Men - Men's Section", value: "/featured/men" },
  { label: "Women - Women's Section", value: "/featured/women" },
  { label: "Brands - All Brands", value: "/featured/brands" },
  { label: "Cart - Shopping Cart", value: "/cart" },
  { label: "Checkout - Checkout Page", value: "/checkout" },
  { label: "Custom URL...", value: "custom" },
] as const;

export default function HomepageAdminPage() {
  const pageContext = usePageContext();
  const session = pageContext.clientSession;

const MERCHANT_ID = getStoreOwnerId();

  const [content, setContent] = useState<HomepageContent>(
    DEFAULT_HOMEPAGE_CONTENT,
  );
  const [originalContent, setOriginalContent] = useState<HomepageContent>(
    DEFAULT_HOMEPAGE_CONTENT,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [imageUrlCopied, setImageUrlCopied] = useState(false);

  // Hero CTA dropdown state
  const [heroCTAMode, setHeroCTAMode] = useState<"predefined" | "custom">(
    "predefined",
  );
  const [heroCTACustomValue, setHeroCTACustomValue] = useState("");

  // Check for unsaved changes whenever content changes
  useEffect(() => {
    const contentChanged =
      JSON.stringify(content) !== JSON.stringify(originalContent);
    setHasUnsavedChanges(contentChanged);
  }, [content, originalContent]);

  // Load existing content
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const result = await trpc.homepage.getContent.query({
        merchantId: MERCHANT_ID,
      });

      if (result.success && result.result) {
        setContent(result.result);
        setOriginalContent(result.result);

        // Initialize hero CTA mode based on loaded content
        const ctaLink = result.result.hero.ctaLink;
        const isPredefined = PREDEFINED_ROUTES.some(
          (route) => route.value === ctaLink,
        );

        if (isPredefined) {
          setHeroCTAMode("predefined");
        } else {
          setHeroCTAMode("custom");
          setHeroCTACustomValue(ctaLink);
        }
      } else {
        toast.error("Failed to load homepage content");
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Error loading homepage content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Check if user is admin (when auth is fully integrated)
    if (session && session.role !== "admin") {
      toast.error("Only administrators can update homepage content");
      return;
    }

    setIsSaving(true);
    try {
      // Auto-trim whitespace from text fields
      const trimmedContent: HomepageContent = {
        ...content,
        hero: {
          ...content.hero,
          title: content.hero.title.trim(),
          subtitle: content.hero.subtitle.trim(),
          ctaText: content.hero.ctaText.trim(),
        },
        promoBanner: {
          ...content.promoBanner,
          text: content.promoBanner.text.trim(),
          linkText: content.promoBanner.linkText?.trim(),
        },
        valueProps: {
          ...content.valueProps,
          items: content.valueProps.items.map((item) => ({
            ...item,
            title: item.title.trim(),
            description: item.description.trim(),
          })),
        },
        categories: {
          ...content.categories,
          title: content.categories.title.trim(),
          subtitle: content.categories.subtitle.trim(),
        },
        featuredProducts: {
          ...content.featuredProducts,
          title: content.featuredProducts.title.trim(),
          subtitle: content.featuredProducts.subtitle.trim(),
        },
        newsletter: {
          ...content.newsletter,
          title: content.newsletter.title.trim(),
          subtitle: content.newsletter.subtitle.trim(),
        },
        footerCta: {
          ...content.footerCta,
          title: content.footerCta.title.trim(),
          subtitle: content.footerCta.subtitle.trim(),
        },
      };

      const result = await trpc.homepage.updateContent.mutate({
        merchantId: MERCHANT_ID,
        content: trimmedContent,
      });

      if (result.success) {
        const savedAt = new Date();
        setLastSavedAt(savedAt);
        toast.success("Homepage content saved successfully!");
        setContent(trimmedContent);
        setOriginalContent(trimmedContent);
        setHasUnsavedChanges(false);
      } else {
        toast.error("Failed to save homepage content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Error saving homepage content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all content to defaults? This will discard all your changes.",
      )
    ) {
      setContent(DEFAULT_HOMEPAGE_CONTENT);
      setOriginalContent(DEFAULT_HOMEPAGE_CONTENT);
      setHeroCTAMode("predefined");
      setHeroCTACustomValue("");
      setHasUnsavedChanges(false);
      setLastSavedAt(null);
      toast.info("Content reset to defaults");
    }
  };

  const handlePreviewHomepage = async () => {
    if (hasUnsavedChanges) {
      // Auto-save before preview
      const saveSuccess = await new Promise<boolean>((resolve) => {
        (async () => {
          if (session && session.role !== "admin") {
            toast.error("Only administrators can update homepage content");
            resolve(false);
            return;
          }

          setIsSaving(true);
          try {
            // Auto-trim whitespace from text fields
            const trimmedContent: HomepageContent = {
              ...content,
              hero: {
                ...content.hero,
                title: content.hero.title.trim(),
                subtitle: content.hero.subtitle.trim(),
                ctaText: content.hero.ctaText.trim(),
              },
              promoBanner: {
                ...content.promoBanner,
                text: content.promoBanner.text.trim(),
                linkText: content.promoBanner.linkText?.trim(),
              },
              valueProps: {
                ...content.valueProps,
                items: content.valueProps.items.map((item) => ({
                  ...item,
                  title: item.title.trim(),
                  description: item.description.trim(),
                })),
              },
              categories: {
                ...content.categories,
                title: content.categories.title.trim(),
                subtitle: content.categories.subtitle.trim(),
              },
              featuredProducts: {
                ...content.featuredProducts,
                title: content.featuredProducts.title.trim(),
                subtitle: content.featuredProducts.subtitle.trim(),
              },
              newsletter: {
                ...content.newsletter,
                title: content.newsletter.title.trim(),
                subtitle: content.newsletter.subtitle.trim(),
              },
              footerCta: {
                ...content.footerCta,
                title: content.footerCta.title.trim(),
                subtitle: content.footerCta.subtitle.trim(),
              },
            };

            const result = await trpc.homepage.updateContent.mutate({
              merchantId: MERCHANT_ID,
              content: trimmedContent,
            });

            if (result.success) {
              const savedAt = new Date();
              setLastSavedAt(savedAt);
              toast.success("Saved successfully! Opening preview...");
              setContent(trimmedContent);
              setOriginalContent(trimmedContent);
              setHasUnsavedChanges(false);
              resolve(true);
            } else {
              toast.error("Failed to save. Preview not opened.");
              resolve(false);
            }
          } catch (error) {
            console.error("Error saving content:", error);
            toast.error("Error saving. Preview not opened.");
            resolve(false);
          } finally {
            setIsSaving(false);
          }
        })();
      });

      if (saveSuccess) {
        window.open("/", "_blank");
      }
    } else {
      toast.info("Preview shows latest saved changes");
      window.open("/", "_blank");
    }
  };

  // Upload hero background image
  const handleUploadHeroImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      // Convert file to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload via tRPC
      const result = await trpc.homepage.uploadHeroImage.mutate({
        file: {
          name: file.name,
          type: file.type,
          buffer: buffer,
        },
      });

      if (result.success && result.data) {
        // Auto-fill the background image URL field
        setContent((prev) => ({
          ...prev,
          hero: {
            ...prev.hero,
            backgroundImage: result.data.url,
          },
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image");
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      event.target.value = "";
    }
  };

  // Remove hero background image
  const handleRemoveHeroImage = () => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgroundImage: undefined,
      },
    }));
    toast.info("Background image removed");
  };

  // Copy image URL to clipboard
  const handleCopyImageUrl = async () => {
    if (!content.hero.backgroundImage) return;

    try {
      await navigator.clipboard.writeText(content.hero.backgroundImage);
      setImageUrlCopied(true);
      toast.success("Image URL copied!");
      setTimeout(() => setImageUrlCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy URL");
    }
  };

  // Upload brand statement image
  const handleUploadBrandStatementImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      // Convert file to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload via tRPC with preserveAspect: true for brand statement
      const result = await trpc.homepage.uploadHeroImage.mutate({
        file: {
          name: file.name,
          type: file.type,
          buffer: buffer,
        },
        preserveAspect: true, // Don't crop brand statement images
      });

      if (result.success && result.data) {
        // Auto-fill the brand statement image URL field
        setContent((prev) => ({
          ...prev,
          brandStatement: {
            ...prev.brandStatement,
            image: result.data.url,
          },
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image");
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      event.target.value = "";
    }
  };

  // Remove brand statement image
  const handleRemoveBrandStatementImage = () => {
    setContent((prev) => ({
      ...prev,
      brandStatement: {
        ...prev.brandStatement,
        image: undefined,
      },
    }));
    toast.info("Brand statement image removed");
  };

  // Hero CTA handlers
  const handleHeroCTAChange = (value: string) => {
    if (value === "custom") {
      setHeroCTAMode("custom");
      setContent((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          ctaLink: heroCTACustomValue || "",
        },
      }));
    } else {
      setHeroCTAMode("predefined");
      setContent((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          ctaLink: value,
        },
      }));
    }
  };

  const handleCustomCTAChange = (value: string) => {
    setHeroCTACustomValue(value);
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        ctaLink: value,
      },
    }));
  };

  const validateCustomCTA = (value: string): boolean => {
    if (!value) return false;
    return (
      value.startsWith("/") ||
      value.startsWith("https://") ||
      value.startsWith("http://")
    );
  };

  // Value props handlers
  const addValueProp = () => {
    if (content.valueProps.items.length >= 6) {
      toast.error("Maximum 6 value propositions allowed");
      return;
    }

    setContent((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: [
          ...prev.valueProps.items,
          {
            icon: ValuePropIconType.SHOPPING,
            title: "New Feature",
            description: "Description here",
          },
        ],
      },
    }));
  };

  const removeValueProp = (index: number) => {
    setContent((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: prev.valueProps.items.filter((_, i) => i !== index),
      },
    }));
  };

  const updateValueProp = (
    index: number,
    field: keyof ValuePropItem,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: prev.valueProps.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  // Validation helpers (non-blocking warnings)
  const getHeroTitleWarning = () => {
    if (content.hero.title.length > 40) {
      return "Title is longer than recommended (40 characters)";
    }
    return null;
  };

  const getHeroSubtitleWarning = () => {
    if (content.hero.subtitle.length > 90) {
      return "Subtitle is longer than recommended (90 characters)";
    }
    return null;
  };

  const getHeroCtaTextWarning = () => {
    if (content.hero.ctaText.length > 20) {
      return "Button label is longer than recommended (20 characters)";
    }
    return null;
  };

  const getHeroImageWarning = () => {
    const url = content.hero.backgroundImage;
    if (url && !url.startsWith("/") && !url.startsWith("http")) {
      return "URL should start with / or http";
    }
    return null;
  };

  const getPromoBannerWarning = () => {
    if (content.promoBanner.enabled && !content.promoBanner.text.trim()) {
      return "Banner is enabled but text is empty";
    }
    if (content.promoBanner.linkUrl && !content.promoBanner.linkText?.trim()) {
      return "Link URL exists but link text is empty";
    }
    return null;
  };

  const getValuePropWarning = (item: ValuePropItem) => {
    if (!item.title.trim()) return "Title is empty";
    if (!item.description.trim()) return "Description is empty";
    return null;
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <p className='text-muted-foreground'>Loading homepage content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Homepage Content Editor</h1>
          <p className='text-muted-foreground mt-1'>
            Customize your homepage sections and content
          </p>
          {hasUnsavedChanges && (
            <div className='flex items-center gap-2 mt-2 text-amber-600'>
              <AlertCircle className='w-4 h-4' />
              <span className='text-sm font-medium'>Unsaved changes</span>
            </div>
          )}
          {lastSavedAt && !hasUnsavedChanges && (
            <p className='text-sm text-muted-foreground mt-2'>
              Last saved at{" "}
              {lastSavedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={handlePreviewHomepage}
            disabled={isSaving}>
            <ExternalLink className='w-4 h-4 mr-2' />
            Preview Homepage
          </Button>
          <Button variant='outline' onClick={handleReset} disabled={isSaving}>
            <RotateCcw className='w-4 h-4 mr-2' />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}>
            <Save className='w-4 h-4 mr-2' />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {!session && (
        <Alert className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            You are not logged in. Changes will be saved using the default
            merchant ID.
          </AlertDescription>
        </Alert>
      )}

      {session && session.role !== "admin" && (
        <Alert className='mb-6 border-amber-500 bg-amber-50'>
          <AlertCircle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800'>
            Only administrators can update homepage content. You can view and
            edit, but changes cannot be saved.
          </AlertDescription>
        </Alert>
      )}

      <div className='space-y-6'>
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Hero Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='hero-enabled'>Enabled</Label>
                <Switch
                  id='hero-enabled'
                  checked={content.hero.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='hero-title'>Title</Label>
              <Input
                id='hero-title'
                value={content.hero.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title: e.target.value },
                  }))
                }
                placeholder='Welcome to Our Store'
                disabled={!content.hero.enabled}
              />
              {getHeroTitleWarning() && (
                <p className='text-sm text-amber-600 mt-1'>
                  ⚠️ {getHeroTitleWarning()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='hero-subtitle'>Subtitle</Label>
              <Textarea
                id='hero-subtitle'
                value={content.hero.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, subtitle: e.target.value },
                  }))
                }
                placeholder='Discover amazing products curated just for you'
                disabled={!content.hero.enabled}
                rows={2}
              />
              {getHeroSubtitleWarning() && (
                <p className='text-sm text-amber-600 mt-1'>
                  ⚠️ {getHeroSubtitleWarning()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='hero-cta-text'>Primary Button Label</Label>
              <Input
                id='hero-cta-text'
                value={content.hero.ctaText}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, ctaText: e.target.value },
                  }))
                }
                placeholder='Start Shopping'
                disabled={!content.hero.enabled}
              />
              {getHeroCtaTextWarning() && (
                <p className='text-sm text-amber-600 mt-1'>
                  ⚠️ {getHeroCtaTextWarning()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='hero-cta-link'>Primary Button Link</Label>
              {heroCTAMode === "predefined" ? (
                <Select
                  value={content.hero.ctaLink}
                  onValueChange={handleHeroCTAChange}
                  disabled={!content.hero.enabled}>
                  <SelectTrigger id='hero-cta-link'>
                    <SelectValue placeholder='Select a page' />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_ROUTES.map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='space-y-2'>
                  <div className='flex gap-2'>
                    <Input
                      value={heroCTACustomValue}
                      onChange={(e) => handleCustomCTAChange(e.target.value)}
                      placeholder='/your-page or https://example.com'
                      disabled={!content.hero.enabled}
                      className={
                        heroCTACustomValue &&
                        !validateCustomCTA(heroCTACustomValue)
                          ? "border-red-500"
                          : ""
                      }
                    />
                    <Button
                      variant='outline'
                      onClick={() => {
                        setHeroCTAMode("predefined");
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, ctaLink: "/shop" },
                        }));
                      }}
                      disabled={!content.hero.enabled}>
                      Use Preset
                    </Button>
                  </div>
                  {heroCTACustomValue &&
                    !validateCustomCTA(heroCTACustomValue) && (
                      <p className='text-sm text-red-500'>
                        URL must start with / or https://
                      </p>
                    )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor='hero-bg-image'>
                Background Image URL (optional)
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='hero-bg-image'
                  value={content.hero.backgroundImage || ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        backgroundImage: e.target.value || undefined,
                      },
                    }))
                  }
                  placeholder='/uploads/homepage/hero.webp or https://...'
                  disabled={!content.hero.enabled}
                />
                <div className='flex gap-2'>
                  {content.hero.backgroundImage && (
                    <>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        disabled={!content.hero.enabled}
                        onClick={handleCopyImageUrl}
                        title='Copy URL'>
                        {imageUrlCopied ? (
                          <Check className='w-4 h-4' />
                        ) : (
                          <Copy className='w-4 h-4' />
                        )}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        disabled={!content.hero.enabled}
                        onClick={handleRemoveHeroImage}
                        title='Remove image'>
                        <X className='w-4 h-4' />
                      </Button>
                    </>
                  )}
                  <input
                    type='file'
                    id='hero-image-upload'
                    accept='image/jpeg,image/jpg,image/png,image/webp'
                    onChange={handleUploadHeroImage}
                    disabled={!content.hero.enabled || isUploadingImage}
                    className='hidden'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='md'
                    disabled={!content.hero.enabled || isUploadingImage}
                    onClick={() =>
                      document.getElementById("hero-image-upload")?.click()
                    }>
                    {isUploadingImage ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Upload className='w-4 h-4 mr-2' />
                        {content.hero.backgroundImage ? "Replace" : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className='space-y-1 mt-1'>
                <p className='text-sm text-muted-foreground'>
                  Recommended size: 1920×1080 • Max size: 5MB (JPG, PNG, WebP)
                </p>
                {getHeroImageWarning() && (
                  <p className='text-sm text-amber-600'>
                    ⚠️ {getHeroImageWarning()}
                  </p>
                )}
              </div>
              {content.hero.backgroundImage && (
                <div className='mt-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <Label className='text-sm text-muted-foreground'>
                      Preview:
                    </Label>
                    <a
                      href={content.hero.backgroundImage}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                      <ExternalLink className='w-3 h-3' />
                      Open in new tab
                    </a>
                  </div>
                  <div className='relative w-full h-32 rounded-lg overflow-hidden border border-border bg-muted'>
                    <img
                      src={content.hero.backgroundImage}
                      alt='Hero background preview'
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="flex items-center justify-center h-full text-sm text-muted-foreground">Failed to load image. Check URL.</div>';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Statement Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Brand Statement Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='brand-statement-enabled'>Enabled</Label>
                <Switch
                  id='brand-statement-enabled'
                  checked={content.brandStatement.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      brandStatement: {
                        ...prev.brandStatement,
                        enabled: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='brand-statement-title'>Title</Label>
              <Input
                id='brand-statement-title'
                value={content.brandStatement.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    brandStatement: {
                      ...prev.brandStatement,
                      title: e.target.value,
                    },
                  }))
                }
                placeholder='Worn with intention. Designed for life.'
                disabled={!content.brandStatement.enabled}
              />
            </div>

            <div>
              <Label htmlFor='brand-statement-description'>Description</Label>
              <Textarea
                id='brand-statement-description'
                value={content.brandStatement.description}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    brandStatement: {
                      ...prev.brandStatement,
                      description: e.target.value,
                    },
                  }))
                }
                placeholder='Every piercing is an expression of self...'
                disabled={!content.brandStatement.enabled}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='brand-statement-image'>
                Image URL (optional)
              </Label>
              <Input
                id='brand-statement-image'
                value={content.brandStatement.image || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    brandStatement: {
                      ...prev.brandStatement,
                      image: e.target.value || undefined,
                    },
                  }))
                }
                placeholder='/uploads/homepage/brand-statement.jpg'
                disabled={!content.brandStatement.enabled}
              />
              <p className='text-sm text-muted-foreground mt-1'>
                Recommended: Editorial portrait image (ear piercing close-up)
              </p>

              {/* Upload Controls */}
              <div className='flex gap-2 mt-3'>
                <input
                  type='file'
                  id='brand-statement-file-input'
                  accept='image/jpeg,image/jpg,image/png,image/webp'
                  onChange={handleUploadBrandStatementImage}
                  className='hidden'
                  disabled={!content.brandStatement.enabled || isUploadingImage}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!content.brandStatement.enabled || isUploadingImage}
                  onClick={() =>
                    document
                      .getElementById("brand-statement-file-input")
                      ?.click()
                  }>
                  {isUploadingImage ? "Uploading..." : "Upload Image"}
                </Button>
                {content.brandStatement.image && (
                  <>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleRemoveBrandStatementImage}
                      disabled={
                        !content.brandStatement.enabled || isUploadingImage
                      }>
                      Remove
                    </Button>
                  </>
                )}
              </div>

              {content.brandStatement.image && (
                <div className='mt-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <Label className='text-sm text-muted-foreground'>
                      Preview:
                    </Label>
                  </div>
                  <div className='relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted'>
                    <img
                      src={content.brandStatement.image}
                      alt='Brand statement preview'
                      className='w-full h-full object-cover'
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Promo Banner Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Promotional Banner</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='promo-enabled'>Enabled</Label>
                <Switch
                  id='promo-enabled'
                  checked={content.promoBanner.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      promoBanner: { ...prev.promoBanner, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {getPromoBannerWarning() && (
              <div className='text-sm text-amber-600 p-3 bg-amber-50 rounded-md border border-amber-200'>
                ⚠️ {getPromoBannerWarning()}
              </div>
            )}
            <div>
              <Label htmlFor='promo-text'>Banner Text</Label>
              <Input
                id='promo-text'
                value={content.promoBanner.text}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoBanner: { ...prev.promoBanner, text: e.target.value },
                  }))
                }
                placeholder='🎉 Special Offer: Get 20% off!'
                disabled={!content.promoBanner.enabled}
              />
            </div>

            <div>
              <Label htmlFor='promo-url'>Link URL (optional)</Label>
              <Input
                id='promo-url'
                value={content.promoBanner.linkUrl || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoBanner: {
                      ...prev.promoBanner,
                      linkUrl: e.target.value || undefined,
                    },
                  }))
                }
                placeholder='/sale or https://...'
                disabled={!content.promoBanner.enabled}
              />
            </div>

            <div>
              <Label htmlFor='promo-link-text'>Link Text (optional)</Label>
              <Input
                id='promo-link-text'
                value={content.promoBanner.linkText || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoBanner: {
                      ...prev.promoBanner,
                      linkText: e.target.value || undefined,
                    },
                  }))
                }
                placeholder='Shop Now'
                disabled={!content.promoBanner.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Value Propositions Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Value Propositions</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='valueprops-enabled'>Enabled</Label>
                <Switch
                  id='valueprops-enabled'
                  checked={content.valueProps.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      valueProps: { ...prev.valueProps, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {content.valueProps.items.map((item, index) => (
              <div key={index} className='border rounded-lg p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-sm'>Item {index + 1}</h4>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeValueProp(index)}
                    disabled={
                      !content.valueProps.enabled ||
                      content.valueProps.items.length <= 1
                    }>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>

                <div>
                  <Label>Icon</Label>
                  <Select
                    value={item.icon}
                    onValueChange={(value) =>
                      updateValueProp(index, "icon", value)
                    }
                    disabled={!content.valueProps.enabled}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ValuePropIconType.SHOPPING}>
                        Shopping (Bag)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.SHIPPING}>
                        Shipping (Truck)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.SECURITY}>
                        Security (Shield)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.SUPPORT}>
                        Support (Headphones)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.QUALITY}>
                        Quality (Award)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.RETURNS}>
                        Returns (Refresh)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateValueProp(index, "title", e.target.value)
                    }
                    placeholder='Fast Shipping'
                    disabled={!content.valueProps.enabled}
                  />
                  {getValuePropWarning(item) && (
                    <p className='text-sm text-amber-600 mt-1'>
                      ⚠️ {getValuePropWarning(item)}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      updateValueProp(index, "description", e.target.value)
                    }
                    placeholder='Get your orders delivered quickly'
                    disabled={!content.valueProps.enabled}
                    rows={2}
                  />
                </div>
              </div>
            ))}

            {content.valueProps.items.length < 6 && (
              <Button
                variant='outline'
                onClick={addValueProp}
                disabled={!content.valueProps.enabled}
                className='w-full'>
                <Plus className='w-4 h-4 mr-2' />
                Add Value Proposition ({content.valueProps.items.length}/6)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Featured Products Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Featured Products Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='featured-enabled'>Enabled</Label>
                <Switch
                  id='featured-enabled'
                  checked={content.featuredProducts.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      featuredProducts: {
                        ...prev.featuredProducts,
                        enabled: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='featured-title'>Section Title</Label>
              <Input
                id='featured-title'
                value={content.featuredProducts.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    featuredProducts: {
                      ...prev.featuredProducts,
                      title: e.target.value,
                    },
                  }))
                }
                placeholder='Featured Products'
                disabled={!content.featuredProducts.enabled}
              />
            </div>

            <div>
              <Label htmlFor='featured-subtitle'>Section Subtitle</Label>
              <Textarea
                id='featured-subtitle'
                value={content.featuredProducts.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    featuredProducts: {
                      ...prev.featuredProducts,
                      subtitle: e.target.value,
                    },
                  }))
                }
                placeholder='Check out our handpicked selection'
                disabled={!content.featuredProducts.enabled}
                rows={2}
              />
            </div>

            <div className='bg-muted p-3 rounded-md'>
              <p className='text-sm text-muted-foreground'>
                <strong>Note:</strong> Products are automatically fetched from
                your catalog. This section only controls the title and subtitle
                text.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save/Reset buttons at bottom */}
        <div className='flex items-center justify-between pt-6 border-t'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' onClick={handleReset} disabled={isSaving}>
              <RotateCcw className='w-4 h-4 mr-2' />
              Reset to Defaults
            </Button>
            <Button
              variant='outline'
              onClick={handlePreviewHomepage}
              disabled={isSaving}>
              <ExternalLink className='w-4 h-4 mr-2' />
              Preview Homepage
            </Button>
          </div>
          <div className='flex items-center gap-3'>
            {hasUnsavedChanges && (
              <span className='text-sm text-amber-600 font-medium'>
                Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              size='lg'>
              <Save className='w-4 h-4 mr-2' />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
