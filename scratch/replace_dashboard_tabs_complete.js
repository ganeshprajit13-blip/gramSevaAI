const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'app', 'admin', 'dashboard', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

const startTag = '{/* 4. CERTIFICATES VERIFICATION TAB */}';
const endTag = '{/* 7. AI ASSISTANT CONFIGURATION TAB */}';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{/* 4. COMPLAINTS MANAGEMENT TAB */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Village Grievance & Complaints Resolution Desk</h3>
                  <p className="text-xs text-muted-foreground">Inspect submitted citizen grievances, update resolution status, and send officer remarks</p>
                </div>
                <span className="badge bg-red-500/10 text-red-500 font-bold border-red-500/20">
                  Live Grievance Store
                </span>
              </div>

              {(() => {
                const liveComplaints = getStoredComplaints()
                return (
                  <div className="space-y-4">
                    {liveComplaints.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-8 text-center">No citizen complaints currently registered.</p>
                    ) : (
                      liveComplaints.map((cmp) => {
                        const statusColors: Record<string, string> = {
                          Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold',
                          Accepted: 'bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold',
                          'In Progress': 'bg-purple-500/10 text-purple-500 border-purple-500/20 font-bold',
                          Resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold',
                          Rejected: 'bg-red-500/10 text-red-500 border-red-500/20 font-bold',
                        }

                        return (
                          <div key={cmp.id} className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-background px-2.5 py-1 rounded-md border border-border">{cmp.id}</span>
                                <span className="badge bg-primary/10 text-primary font-bold">{cmp.category}</span>
                                <span className="text-xs font-semibold text-muted-foreground">{cmp.village} ({cmp.ward_number})</span>
                              </div>
                              <span className={"badge " + (statusColors[cmp.status] || "badge-secondary")}>
                                {cmp.status}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-sm text-foreground">{cmp.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cmp.description}</p>
                              <p className="text-[11px] text-muted-foreground font-semibold mt-1">Submitted by: <strong>{cmp.resident_name}</strong> (Mobile: {cmp.resident_mobile})</p>
                            </div>

                            {cmp.bdo_remarks && (
                              <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
                                <span className="font-bold text-primary block">BDO Officer Remarks:</span>
                                <p className="italic text-muted-foreground">"{cmp.bdo_remarks}"</p>
                              </div>
                            )}

                            {/* BDO Action Buttons */}
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Update Status:</span>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Applicant:', 'BDO Accepted your complaint. Inspection team assigned.')
                                  if (remarks !== null) updateComplaintStatus(cmp.id, 'Accepted', remarks)
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                              >
                                Accept 🟢
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Applicant:', 'Work in progress by Panchayat team.')
                                  if (remarks !== null) updateComplaintStatus(cmp.id, 'In Progress', remarks)
                                }}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold"
                              >
                                In Progress 🔵
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Applicant:', 'Grievance resolved and verified.')
                                  if (remarks !== null) updateComplaintStatus(cmp.id, 'Resolved', remarks)
                                }}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                              >
                                Mark Resolved ✅
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Reason for Rejection:', 'Duplicate or invalid request.')
                                  if (remarks !== null) updateComplaintStatus(cmp.id, 'Rejected', remarks)
                                }}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold"
                              >
                                Reject 🔴
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* 5. ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Village Public Announcements Broadcasting Center</h3>
                  <p className="text-xs text-muted-foreground">Publish Gram Sabha meetings, health camps, subsidy distributions, and emergency notices</p>
                </div>
                <button
                  onClick={() => setShowAddAnnounce(true)}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" /> Publish Village Notice
                </button>
              </div>

              {/* Add Announcement Modal */}
              {showAddAnnounce && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-card border border-border p-6 rounded-3xl w-full max-w-xl space-y-4 my-8">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="font-black text-base text-foreground">Publish Village Public Announcement</h3>
                      <button onClick={() => setShowAddAnnounce(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const form = e.target as HTMLFormElement
                        const titleVal = (form.elements.namedItem('ann_title') as HTMLInputElement).value
                        const catVal = (form.elements.namedItem('ann_cat') as HTMLSelectElement).value
                        const dateVal = (form.elements.namedItem('ann_date') as HTMLInputElement).value
                        const startTimeVal = (form.elements.namedItem('ann_start') as HTMLInputElement).value
                        const endTimeVal = (form.elements.namedItem('ann_end') as HTMLInputElement).value
                        const venueVal = (form.elements.namedItem('ann_venue') as HTMLInputElement).value
                        const villageVal = (form.elements.namedItem('ann_village') as HTMLInputElement).value
                        const restrictionsVal = (form.elements.namedItem('ann_restr') as HTMLInputElement).value
                        const descVal = (form.elements.namedItem('ann_desc') as HTMLTextAreaElement).value
                        const imgVal = (form.elements.namedItem('ann_img') as HTMLInputElement).value

                        saveAnnouncement({
                          title: titleVal,
                          category: catVal as any,
                          date: dateVal,
                          start_time: startTimeVal,
                          end_time: endTimeVal,
                          venue: venueVal,
                          village: villageVal,
                          eligibility_restrictions: restrictionsVal,
                          description: descVal,
                          image_url: imgVal || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
                          organizer: 'BDO Office',
                          contact_number: '1800-425-1000',
                          status: 'Published'
                        })

                        toast.success('🎉 Village Announcement Published Successfully!')
                        setShowAddAnnounce(false)
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Announcement Title</label>
                        <input name="ann_title" required type="text" placeholder="e.g. Special Gram Sabha Budget Meeting" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Category</label>
                          <select name="ann_cat" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-bold">
                            <option value="Gram Sabha">Gram Sabha</option>
                            <option value="Health Camp">Health Camp</option>
                            <option value="Awareness Rally">Awareness Rally</option>
                            <option value="Crop Subsidy Distribution">Crop Subsidy Distribution</option>
                            <option value="Public Works">Public Works</option>
                            <option value="Emergency Alert">Emergency Alert</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Event Date</label>
                          <input name="ann_date" required type="date" defaultValue="2026-08-05" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Start Time</label>
                          <input name="ann_start" defaultValue="10:00 AM" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">End Time</label>
                          <input name="ann_end" defaultValue="01:00 PM" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Venue / Location</label>
                          <input name="ann_venue" required type="text" placeholder="Gram Panchayat Hall" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Target Village / Ward</label>
                          <input name="ann_village" defaultValue="All Villages" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Target Audience & Restrictions</label>
                        <input name="ann_restr" defaultValue="Open to all adult residents (18+ yrs)." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Detailed Content</label>
                        <textarea name="ann_desc" required rows={3} placeholder="Provide details of agenda, required documents to bring..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-medium" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Flyer Image URL (Optional)</label>
                        <input name="ann_img" type="text" placeholder="https://..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-medium" />
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-border">
                        <button type="button" onClick={() => setShowAddAnnounce(false)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black shadow-sm">Publish Announcement</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Published Announcements Feed */}
              {(() => {
                const liveAnnouncements = getStoredAnnouncements()
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liveAnnouncements.map((anc) => (
                      <div key={anc.id} className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="badge bg-primary/10 text-primary font-bold">{anc.category}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{anc.date}</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-foreground">{anc.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{anc.description}</p>
                        </div>

                        <div className="p-2.5 bg-background border border-border rounded-xl text-[11px] space-y-1">
                          <div className="flex justify-between"><span className="text-muted-foreground">Time:</span> <span className="font-bold">{anc.start_time} - {anc.end_time}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Venue:</span> <span className="font-bold">{anc.venue}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Restrictions:</span> <span className="font-bold text-amber-600">{anc.eligibility_restrictions}</span></div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => deleteAnnouncement(anc.id)}
                            className="px-3 py-1 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                          >
                            Delete Notice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          `;

  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated complaints and announcements tabs in admin dashboard.');
} else {
  console.error('Could not find start or end tags in dashboard content.');
}
