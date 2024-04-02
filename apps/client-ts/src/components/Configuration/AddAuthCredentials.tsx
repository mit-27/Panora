'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,

  DialogTrigger,
} from "@/components/ui/dialog"
import {ScrollArea} from '@/components/ui/scrollbar'
import { Input } from "@/components/ui/input"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import useProjectStore from "@/state/projectStore"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import useWebhookMutation from "@/hooks/mutations/useWebhookMutation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {PasswordInput} from '@/components/ui/password-input'
import { scopes } from "@panora/shared"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
// import { toast } from "@/components/ui/use-toast"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from "@/components/ui/command"
import { watch } from "fs"

const formSchema = z.object({
    provider: z.string({
        required_error: "Please select a provider.",
      }),
    authMethod : z.string({
        required_error: "Please select a authentication method",
    }),
    clientID : z.string({
        required_error: "Please Enter a Client ID",
    }),
    clientSecret : z.string({
        required_error: "Please Enter a Client Secret",
    }),
    apiKey: z.string({
        required_error: "Please Enter a API Key",
    }),
    scope : z.string({
        required_error: "Please Enter a scope",
    })

})

const providers = [
    { 
        label: "Hubspot", value: "hubspot",  
      logoPath: "https://assets-global.website-files.com/6421a177cdeeaf3c6791b745/64d61202dd99e63d40d446f6_hubspot%20logo.png",

    },
    { 
        label: "Attio", value: "attio" ,
        logoPath: "https://asset.brandfetch.io/idZA7HYRWK/idYZS6Vp_r.png",

    },
    { 
        label: "Zoho", value: "zoho" ,
      logoPath: 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',

    },
    { 
        label: "Pipedrive", value: "pipedrive" ,
      logoPath: 'https://asset.brandfetch.io/idZG_U1qqs/ideqSFbb2E.jpeg',

    },
    { 
        label: "Zendesk", value: "zendesk" ,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',

    },
    {
        label:"Freshsales",value:"freshsales",
        logoPath: 'https://play-lh.googleusercontent.com/Mwgb5c2sVHGHoDlthAYPnMGekEOzsvMR5zotxskrl0erKTW-xpZbuIXn7AEIqvrRHQ',

    }
    
  ] as const

const AddAuthCredentials = () => {
    const [open, setOpen] = useState(false);
    const [popoverOpen,setPopOverOpen] = useState(false);


    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        form.reset()
      };

    const handlePopOverClose = () => {
        setPopOverOpen(false);
    }
    //const [secret, setSecret] = useState('');
    const posthog = usePostHog()

    const {idProject} = useProjectStore();

    const { mutate } = useWebhookMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            provider: "",
            authMethod: "",
        },
        
    })

    const Watch = form.watch()

    
    function onSubmit(values: z.infer<typeof formSchema>) {
        
    }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[210px] justify-between")}
            onClick={ () => {
                posthog?.capture("add_webhook_button_clicked", {
                    id_project: idProject,
                    mode: config.DISTRIBUTION
                })
            }}
          >
            <PlusCircledIcon className=" h-5 w-5" />
            Add 0Auth Credentials
        </Button>
        </DialogTrigger>
        <DialogContent className="sm:w-[450px]">
        <Form {...form}>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Add 0Auth Credentials</CardTitle>
                    <CardDescription>
                    Add your provider's Credentials for connection.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-4">
                        {/* <div className="grip gap-4"> */}
                        <FormField
                        control={form.control}
                        name="provider"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Provider</FormLabel>
                            <Popover modal open={popoverOpen} onOpenChange={setPopOverOpen}>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value
                                        ? providers.find(
                                            (provider) => provider.value === field.value
                                        )?.label
                                        : "Select provider"}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent  side="bottom" className="p-0">
                                <Command  className="w-full">
                                    <CommandInput
                                    placeholder="Search provider..."
                                    className="h-9 w-full"
                                    
                                    />
                                    <CommandEmpty>No Provider found.</CommandEmpty>
                                    <ScrollArea className="h-40">

                                    <CommandGroup>
                                    {providers.map((provider) => (
                                        <CommandItem
                                        value={provider.label}
                                        key={provider.value}
                                        onSelect={() => {
                                            form.setValue("provider", provider.value)
                                            handlePopOverClose();
                                        }}
                                        className={field.value===provider.value ? "bg-gray-200 w-full" : "w-full"}
                                        
                                        >
                                        <div
                                        // key={index}
                                        className="flex items-center justify-between px-4 py-2 w-full cursor-pointer"
                                        // onClick={() => handleWalletClick(provider.name)}
                                        >
                                        <div className="flex items-center w-full">
                                            <img className="w-4 h-4 rounded-lg mr-3" src={provider.logoPath} alt={provider.label} />
                                            <span>{provider.label}</span>
                                            
                                        </div>
                                        {/* <CheckIcon
                                            className={cn(
                                            "h-4 w-4 flex ",
                                            provider.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            /> */}
                                        
                                        
                                        </div>
                                        
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                    </ScrollArea>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {/* <FormDescription>
                                        This is the language that will be used in the dashboard.
                                    </FormDescription> */}
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                        {/* </div> */}
                    </div>
                    <div className="grid gap-4">
                        <FormField
                        control={form.control}
                        name="authMethod"
                        render={({field}) => (
                                <FormItem>
                                    <FormLabel className="flex flex-col">Authentication Method</FormLabel>
                                    <FormControl>
                                        <Select 
                                            onValueChange={field.onChange} defaultValue={field.value}
                                        >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Authentication Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0Auth2">0Auth2</SelectItem>
                                            <SelectItem value="API">API</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                        )}
                        />

                    </div>

                    {/* If Authentication Method is 0Auth2 */}

                    {Watch.authMethod==="0Auth2" ? 
                        <>
                        <div className="flex flex-col">
                            <FormField
                            name="clientID"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="flex flex-col">Client ID</FormLabel>
                                    <FormControl>
                                    <PasswordInput id="clientID" value={field.value} onChange={field.onChange} placeholder="Enter Client ID" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                        </div>
                        <div className="flex flex-col">
                            <FormField
                            name="clientSecret"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="flex flex-col">Client Secret</FormLabel>
                                    <FormControl>
                                    <PasswordInput id="clientID" value={field.value} onChange={field.onChange} placeholder="Enter Client Secret" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                        </div>
                        <div className="flex flex-col">
                            <FormField
                            name="scope"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="flex flex-col">Scope</FormLabel>
                                    <FormControl>
                                    <Input id="clientSecret" value={field.value} onChange={field.onChange} placeholder="Enter Scopes" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                        </div>
                        </>   
                        :
                        <></>}

                    {Watch.authMethod==="API" ? 
                        <>
                        <div className="flex flex-col">
                            <FormField
                            name="apiKey"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="flex flex-col">API Key</FormLabel>
                                    <FormControl>
                                    <Input id="apikey" value={field.value} onChange={field.onChange} placeholder="Enter API Key" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                        </div>
                        </>   
                        :
                        <></>}






                    </CardContent>
                    <CardFooter className="justify-between space-x-2">
                        <Button type="submit">Submit</Button>
                    </CardFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>   
  )
}

export default AddAuthCredentials;