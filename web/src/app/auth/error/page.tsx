"use client";

import { Button } from "@tremor/react";
import Link from "next/link";
import { FiLogIn } from "react-icons/fi";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="font-bold">
        Anmeldung fehlgeschlagen. Bitte versuche es erneut und/oder wende dich an einen Administrator.
      </div>
      <Link href="/auth/login" className="w-fit">
        <Button className="mt-4" size="xs" icon={FiLogIn}>
          Zurück zum Login
        </Button>
      </Link>
    </div>
  );
};

export default Page;
