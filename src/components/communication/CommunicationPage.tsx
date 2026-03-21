"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Megaphone, MessagesSquare, Plus } from "lucide-react"
import AnnouncementsTab from "./AnnouncementsTab"
import ConversationsTab from "./ConversationsTab"
import { useCommunication } from "@/hooks/useCommunication"
import type { CommunicationConfig, UseCommunicationReturn } from "./types"

interface CommunicationPageProps {
  config: CommunicationConfig
  onNewCommunication?: () => void
  /** Expose hook return so the page wrapper can access refreshAfterAction, etc. */
  hookRef?: React.MutableRefObject<UseCommunicationReturn | null>
}

export default function CommunicationPage({
  config,
  onNewCommunication,
  hookRef,
}: CommunicationPageProps) {
  const comm = useCommunication(config)

  // Expose hook to parent via ref
  if (hookRef) {
    hookRef.current = comm
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessagesSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {config.pageTitle}
              </h1>
              <p className="text-sm text-muted-foreground">{config.pageDescription}</p>
            </div>
          </div>
          {config.canCreateAnnouncement && onNewCommunication && (
            <div className="flex gap-3">
              <Button
                onClick={onNewCommunication}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Nova Comunicação
              </Button>
            </div>
          )}
        </div>

        {/* Main Tabs */}
        <Tabs value={comm.activeTab} onValueChange={comm.setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-white/50 backdrop-blur-sm shadow-md">
            <TabsTrigger
              value="comunicados"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Megaphone className="h-4 w-4" />
              Comunicados
              {comm.announcementUnreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 h-5 px-1.5 text-[10px] ml-1">
                  {comm.announcementUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="conversas"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <MessagesSquare className="h-4 w-4" />
              Conversas
              {comm.chatUnreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 h-5 px-1.5 text-[10px] ml-1">
                  {comm.chatUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Comunicados */}
          <TabsContent value="comunicados" className="mt-6">
            <AnnouncementsTab
              config={config}
              announcements={comm.announcements}
              isLoading={comm.isLoadingAnnouncements}
              selectedAnnouncement={comm.selectedAnnouncement}
              onSelectAnnouncement={comm.setSelectedAnnouncement}
              announcementReply={comm.announcementReply}
              onAnnouncementReplyChange={comm.setAnnouncementReply}
              isSendingAnnouncementReply={comm.isSendingAnnouncementReply}
              onSendAnnouncementReply={comm.handleReplyToAnnouncement}
              onNewCommunication={onNewCommunication}
            />
          </TabsContent>

          {/* Tab 2: Conversas */}
          <TabsContent value="conversas" className="mt-6">
            <ConversationsTab
              conversations={comm.conversations}
              isLoadingConversations={comm.isLoadingConversations}
              selectedConversationId={comm.selectedConversationId}
              onSelectConversation={(id) => comm.setSelectedConversationId(id)}
              activeConversation={comm.activeConversation}
              isLoadingActiveConversation={comm.isLoadingActiveConversation}
              searchQuery={comm.searchQuery}
              onSearchChange={comm.setSearchQuery}
              unreadOnly={comm.unreadOnly}
              onUnreadOnlyChange={comm.setUnreadOnly}
              chatUnreadCount={comm.chatUnreadCount}
              replyText={comm.replyText}
              onReplyTextChange={comm.setReplyText}
              isSendingReply={comm.isSendingReply}
              onSendReply={comm.handleSendReply}
              messagesEndRef={comm.messagesEndRef}
              canCreateConversation={config.canCreateConversation}
              onNewConversation={onNewCommunication}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
