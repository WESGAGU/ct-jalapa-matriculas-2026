import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import RegisterList from "@/components/register/register-list";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Matrículas</h1>
        <Button asChild>
          <Link href="/register/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Matrícula
          </Link>
        </Button>
      </div>

      <div className="mt-10">
         <RegisterList />
      </div>
    </div>
  );
}
