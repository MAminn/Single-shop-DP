import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "#root/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#root/components/ui/form";
import { Input } from "#root/components/ui/input";
import { useState } from "react";

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
});

export default function VendorForm({
  onSubmit,
  defaultValues,
}: {
  defaultValues?: z.infer<typeof formSchema>;
  onSubmit: (values: z.infer<typeof formSchema>) => PromiseLike<void>;
}) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    disabled: submitting,
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    await onSubmit(values);
    setSubmitting(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <input type="hidden" {...form.register("id")} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Store name" type="text" {...field} />
              </FormControl>
              <FormDescription>Store name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full"
          size="lg"
          type="submit"
          disabled={submitting}
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
