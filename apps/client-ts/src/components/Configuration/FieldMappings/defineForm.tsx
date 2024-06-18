/* eslint-disable react/no-unescaped-entities */
'use client'

import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useFieldMappings from "@/hooks/get/useFieldMappings"
import { standardObjects } from "@panora/shared";
import useProjectStore from "@/state/projectStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import useDefineField from "@/hooks/create/useDefineField"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"


const defineFormSchema = z.object({
  standardModel: z.string().min(2, {
    message: "standardModel must be at least 2 characters.",
  }),
  fieldName: z.string().min(2, {
    message: "fieldName must be at least 2 characters.",
  }),
  fieldDescription: z.string().min(2, {
    message: "fieldDescription must be at least 2 characters.",
  }),
  fieldType: z.string().min(2, {
    message: "fieldType must be at least 2 characters.",
  }),
})
 

export function DefineForm({ onClose }: {onClose: () => void}) {

  const defineForm = useForm<z.infer<typeof defineFormSchema>>({
    resolver: zodResolver(defineFormSchema),
    defaultValues: {
      standardModel: "",
      fieldName: "",
      fieldDescription: "",
      fieldType: "",
    },
  })

  const {idProject} = useProjectStore();

  const { data: mappings } = useFieldMappings();
  const { defineMappingPromise } = useDefineField();

  const queryClient = useQueryClient();

  const posthog = usePostHog()

  function onDefineSubmit(values: z.infer<typeof defineFormSchema>) {
    toast.promise(
      defineMappingPromise({
        object_type_owner: values.standardModel,
        name: values.fieldName,
        description: values.fieldDescription,
        data_type: values.fieldType,
      }),
      {
      loading: 'Loading...',
      success: (data: any) => {
        queryClient.setQueryData<any[]>(['mappings'], (oldQueryData = []) => {
          return [...oldQueryData, data];
        });
        return (
          <div className="flex flex-row items-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <div className="ml-2">
              Custom field 
              <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${ values.fieldName }`}</Badge>
              has been defined
            </div>
          </div>
        )
        ;
      },
      error: (err: any) => err.message || 'Error'
    });
    posthog?.capture("field_defined", {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
    onClose();
  }
  return (
    <Form {...defineForm}>
    <form onSubmit={defineForm.handleSubmit(onDefineSubmit)}>
        <CardHeader>
        <CardTitle>Define a custom field</CardTitle>
        <CardDescription>
            Create a custom field in Panora to extend our unified objects. Once done, you can map this field to existing fields in your end-user's software. Find details in
            <a href="https://docs.panora.dev/core-concepts/custom-fields" target="_blank" rel="noopener noreferrer"><strong> documentation</strong></a>.
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
        <div className="space-y-1">
        <FormField
                control={defineForm.control}
                name="standardModel"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>What object to you want to extend?</FormLabel>
                    <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value} >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select an object" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        {standardObjects && standardObjects
                            .map((sObject: string) => (
                            <SelectItem key={sObject} value={sObject}>{sObject}</SelectItem>
                            ))
                        }
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="space-y-1">
            <FormField
                control={defineForm.control}
                name="fieldName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Give your Custom Field an identifier</FormLabel>
                    <FormControl>
                    <Input 
                        placeholder="ex: hair_color, or lead_score" {...field} 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="space-y-1">
            <FormField
                control={defineForm.control}
                name="fieldDescription"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                    <Input 
                        placeholder="My customer's favorite color" {...field} 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="space-y-1">
            <FormField
                control={defineForm.control}
                name="fieldType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Data Type</FormLabel>
                    <FormControl>
                    <Select
                    onValueChange={field.onChange} defaultValue={field.value}
                    >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="string">Text</SelectItem>
                        <SelectItem value="int">Number</SelectItem>
                        <SelectItem value="string[]">Text Array</SelectItem>
                        <SelectItem value="int[]">Number Array</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        </CardContent>
        <CardFooter>
        <Button size="sm" className="h-7 gap-1 w-full" >Create Field</Button>
        </CardFooter>
    </form>
    </Form>
  )
}
        