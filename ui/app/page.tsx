"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { ExternalLink, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ViewHeader } from "@/components/view-header/view-header"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type JobApplication = {
  id: string
  job_title: string
  company: string
  description: string | null
  job_url: string | null
  applied_at: string
  required_skills: string[]
  preferred_skills: string[]
  experience_level: string | null
  salary_range: string | null
  remote_option: "remote" | "onsite"
  ai_summary: string | null
}

const skillColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-cyan-500",
]

// Get a random color for skill
const getSkillColor = (skill: string) => {
  const index = skill.charCodeAt(0) % skillColors.length
  return skillColors[index]
}

export default function JobTracker() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const selectedJobs= useRef<string[]>([])
  const [_, dummyRender] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openJob, setOpenJob] = useState<JobApplication | null>(null)


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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
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
                      {job.required_skills?.slice(0, 3).map((skill) => (
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
      <Dialog open={!!openJob} onOpenChange={() => setOpenJob(null)}>
        <DialogContent className="bg-black border border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{openJob?.job_title}</DialogTitle>
            <DialogDescription className="text-white/70">
              {openJob?.company} • Applied {openJob?.applied_at ? formatDate(openJob.applied_at) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/5 rounded">
                <div className="text-sm text-white/60">Work Type</div>
                <div className="font-medium">{openJob?.remote_option === "remote" ? "Remote" : "On-site"}</div>
              </div>
              {openJob?.experience_level && (
                <div className="text-center p-3 bg-white/5 rounded">
                  <div className="text-sm text-white/60">Experience</div>
                  <div className="font-medium">{openJob.experience_level}</div>
                </div>
              )}
              {openJob?.salary_range && (
                <div className="text-center p-3 bg-white/5 rounded">
                  <div className="text-sm text-white/60">Salary</div>
                  <div className="font-medium">{openJob.salary_range}</div>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {openJob?.ai_summary && (
              <div>
                <h3 className="font-medium mb-2">AI Summary</h3>
                <div className="bg-white/5 p-4 rounded border-l-2 border-white">
                  <p className="text-white/80">{openJob.ai_summary}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {/* {openJob?.description && (
              <div>
                <h3 className="font-medium mb-2">Job Description</h3>
                <div className="bg-white/5 p-4 rounded">
                  <p className="text-white/80 whitespace-pre-wrap">{openJob.description}</p>
                </div>
              </div>
            )} */}

            {/* Skills */}
            <div className="space-y-4">
              {(openJob?.required_skills?.length || 0) > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {openJob?.required_skills?.map((skill, index) => (
                      <Badge key={skill} className={`${getSkillColor(skill)} text-white`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(openJob?.preferred_skills?.length || 0) > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {openJob?.preferred_skills?.map((skill, index) => (
                      <Badge key={skill} variant="outline" className={`${getSkillColor(skill)} opacity-75`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {openJob?.job_url && (
              <div className="pt-4 border-t border-white/20">
                <a
                  href={openJob.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                >
                  View Original Job Posting <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
          <DialogClose asChild>
            <Button className="mt-6 w-full bg-white text-black hover:bg-white/90">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}
