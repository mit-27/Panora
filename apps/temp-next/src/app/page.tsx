"use client"
import Image from "next/image";
import "@panora/embedded-card-react/dist/index.css";

import PanoraProviderCard from "@panora/embedded-card-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h2>Mit here</h2>
      <PanoraProviderCard 
      optionalApiUrl={"http://localhost:3000"}
      name={"hubspot"} // name of the provider  
      projectId={"c9a1b1f8-466d-442d-a95e-11cdd00baf49"} // the project id tied to your organization
      returnUrl={"https://acme.inc"} // the url you want to redirect users to after the connection flow is successful
      linkedUserId={"b860d6c1-28f9-485c-86cd-fb09e60f10a2"}  // the linked id of the user if already created in Panora system or user's info in your system
      />
    </main>
  );
}
