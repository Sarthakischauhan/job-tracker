"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { ExternalLink, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Local imports
import { ViewHeader } from "@/components/view-header/view-header"
import { JobInfoDialog } from "@/components/job-info/job-info"
import { JobApplication, JobStatus } from "@/types/jobTypes"
import { formatDate, getSkillColor, getStatusEmoji } from "@/lib/utils"
import { JobStatusDialog } from "@/components/job-status/job-status"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)


export default function JobTracker() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const selectedJobs= useRef<string[]>([])
  const [_, dummyRender] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openJob, setOpenJob] = useState<JobApplication | null>(null)
  const [openJobStatus, setOpenJobStatus] = useState<JobStatus | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("applied_at", { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.required_skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + rowsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectedJobs.current = paginatedJobs.map((job) => job.id)
    } else {
      selectedJobs.current = []
    }
    dummyRender((n) => n+1)
  }

  // Runs for clicked/selected job
  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      selectedJobs.current = [...selectedJobs.current, jobId]
    } else {
      selectedJobs.current = selectedJobs.current.filter((currentJobId) => jobId !== currentJobId)
    }
    dummyRender((n) => n+1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6">
        <ViewHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {/* Table */}
        <div className="border border-white/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 hover:bg-transparent">
                <TableHead className="w-12 text-white/60">
                  <Checkbox
                    checked={selectedJobs.current.length === paginatedJobs.length && paginatedJobs.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                </TableHead>
                <TableHead className="text-white/60 font-medium">
                  <div className="flex items-center gap-1">
                    Job Title
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="text-white/60 font-medium">
                  <div className="flex items-center gap-1">
                    Company
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="text-white/60 font-medium">Skills</TableHead>
                <TableHead className="text-white/60 font-medium">Experience</TableHead>
                <TableHead className="text-white/60 font-medium">Remote</TableHead>
                <TableHead className="text-white/60 font-medium">
                  <div className="flex items-center gap-1">
                    Applied Date
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="text-white/60 font-medium">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedJobs.map((job) => (
                <TableRow key={job.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <Checkbox
                      checked={selectedJobs.current.includes(job.id)}
                      onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{job.job_title}</span>
                      {job.job_url && (
                        <a
                          href={job.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-white">{job.company}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {job.required_skills?.slice(0, 2).map((skill) => (
                        <Badge key={skill} className={`${getSkillColor(skill)} text-white text-xs px-2 py-1`}>
                          {skill}
                        </Badge>
                      ))}
                      {(job.required_skills?.length || 0) > 3 && (
                        <Badge className="bg-white/20 text-white/80 text-xs px-2 py-1">
                          +{(job.required_skills?.length || 0) - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-white/80">{job.experience_level || "Not specified"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        job.remote_option === "remote" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                      }
                    >
                      {job.remote_option}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-white/70">{formatDate(job.applied_at)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="status-toggle">
                      <Button 
                        variant={"outline"}
                        className="cursor-pointer rounded-full dark"
                        onClick={() => {
                          setCurrentJobId(job.id);
                          setOpenJobStatus(job?.status ?? "applied");
                        }}
                        >
                        {getStatusEmoji(job.status || "applied")}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                      onClick={() => setOpenJob(job)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-white/60 text-sm">
            {selectedJobs.current.length} of {filteredJobs.length} row(s) selected.
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Rows per page</span>
              <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
                <SelectTrigger className="w-16 h-8 bg-transparent border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-white/60 text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                ⟪
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                ⟨
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                ⟩
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                ⟫
              </Button>
            </div>
          </div>
        </div>
      </div>
      <JobInfoDialog openJob={openJob} setOpenJob={setOpenJob} />
      <JobStatusDialog 
        openJobStatus={openJobStatus} 
        setOpenJobStatus={setOpenJobStatus} 
        currentJobId={currentJobId}
        onStatusUpdate={fetchJobs}
      />
    </div>
  )
}
