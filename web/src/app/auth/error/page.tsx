"use client";

import AuthFlowContainer from "@/components/auth/AuthFlowContainer";
import { Button } from "@tremor/react";
import Link from "next/link";
import { FiLogIn } from "react-icons/fi";

const Page = () => {
  return (
    <AuthFlowContainer>
      <div className="flex flex-col space-y-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-text-900 text-center">
          Authentifizierungsfehler
        </h2>
        <p className="text-text-700 text-center">
          Es gab ein Problem beim Versuch, dich anzumelden.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-red-800 font-semibold mb-2">Mögliche Ursachen:</h3>
          <ul className="space-y-2">
            <li className="flex items-center text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Falsche oder abgelaufene Anmeldedaten
            </li>
            <li className="flex items-center text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Temporäre Störung des Authentifizierungssystems
            </li>
            <li className="flex items-center text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Einschränkungen oder Berechtigungen für den Kontozugang
            </li>
          </ul>
        </div>

        <Link href="/auth/login" className="w-full">
          <Button size="lg" icon={FiLogIn} color="indigo" className="w-full">
            Zurück zur Anmeldeseite
          </Button>
        </Link>
        <p className="text-sm text-text-500 text-center">
          Wir empfehlen, es erneut zu versuchen. Wenn du weiterhin Probleme hast,
          wende dich bitte an deinen Systemadministrator, um Hilfe zu erhalten.
        </p>
      </div>
    </AuthFlowContainer>
  );
};

export default Page;
