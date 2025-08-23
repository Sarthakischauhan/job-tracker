import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SetStateAction, Dispatch } from "react";


type headerProps = {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
}

export const ViewHeader = ({searchTerm, setSearchTerm} : headerProps) =>{
    return (
        <>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-semibold">Job Applications</h1>
                <p className="text-white/60 text-sm mt-1">Track and manage your job applications</p>
            </div>
        </div>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
            />
          </div>
        </div>
        </>
    )
}