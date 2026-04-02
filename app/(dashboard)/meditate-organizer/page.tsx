"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, PlusCircle, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { CardsSkeleton } from "@/components/shared/loading-blocks";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createMeditation,
  createPlaylist,
  deletePlaylist,
  getMeditations,
  getPlaylists,
  queryKeys,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";
import { toArray } from "@/lib/utils";

type TabKey = "meditate" | "playlist";

type MeditationFormState = {
  title: string;
  description: string;
  category: string;
  duration: string;
  benefits: string;
  recommendationTags: string;
  emoji: File | null;
  audio: File | null;
};

type PlaylistTrackForm = {
  title: string;
  artist: string;
  duration: string;
  audio: File | null;
  thumbnail: File | null;
};

type PlaylistFormState = {
  name: string;
  meditationId: string;
  category: string;
  description: string;
  playlistIcon: File | null;
  tracks: PlaylistTrackForm[];
};

const defaultMeditationForm: MeditationFormState = {
  title: "",
  description: "",
  category: "General",
  duration: "",
  benefits: "",
  recommendationTags: "",
  emoji: null,
  audio: null,
};

const createEmptyTrack = (): PlaylistTrackForm => ({
  title: "",
  artist: "Snoop Dogg",
  duration: "",
  audio: null,
  thumbnail: null,
});

const defaultPlaylistForm: PlaylistFormState = {
  name: "",
  meditationId: "",
  category: "General",
  description: "",
  playlistIcon: null,
  tracks: [createEmptyTrack()],
};

const PAGE_SIZE = 4;

export default function MeditateOrganizerPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("meditate");
  const [meditationForm, setMeditationForm] = useState<MeditationFormState>(defaultMeditationForm);
  const [playlistForm, setPlaylistForm] = useState<PlaylistFormState>(defaultPlaylistForm);
  const [meditationPage, setMeditationPage] = useState(1);
  const [playlistPage, setPlaylistPage] = useState(1);

  const meditationsQuery = useQuery({
    queryKey: queryKeys.meditations,
    queryFn: getMeditations,
  });

  const playlistsQuery = useQuery({
    queryKey: queryKeys.playlists,
    queryFn: () => getPlaylists(),
  });

  const createMeditationMutation = useMutation({
    mutationFn: createMeditation,
    onSuccess: () => {
      toast.success("Meditation created successfully");
      setMeditationForm(defaultMeditationForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.meditations });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const createPlaylistMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      toast.success("Playlist created successfully");
      setPlaylistForm(defaultPlaylistForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      toast.success("Playlist deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const meditations = meditationsQuery.data;
  const playlists = playlistsQuery.data;

  const paginatedMeditations = useMemo(
    () =>
      (meditations ?? []).slice((meditationPage - 1) * PAGE_SIZE, meditationPage * PAGE_SIZE),
    [meditations, meditationPage],
  );

  const paginatedPlaylists = useMemo(
    () => (playlists ?? []).slice((playlistPage - 1) * PAGE_SIZE, playlistPage * PAGE_SIZE),
    [playlists, playlistPage],
  );

  const meditationPages = Math.max(1, Math.ceil((meditations?.length || 0) / PAGE_SIZE));
  const playlistPages = Math.max(1, Math.ceil((playlists?.length || 0) / PAGE_SIZE));

  const meditationEmojiPreview = meditationForm.emoji
    ? URL.createObjectURL(meditationForm.emoji)
    : "";

  const setMeditationField = (key: keyof MeditationFormState, value: string | File | null) => {
    setMeditationForm((prev) => ({ ...prev, [key]: value }));
  };

  const setPlaylistField = (key: keyof PlaylistFormState, value: string | File | null) => {
    setPlaylistForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateTrack = (
    trackIndex: number,
    key: keyof PlaylistTrackForm,
    value: string | File | null,
  ) => {
    setPlaylistForm((prev) => {
      const tracks = [...prev.tracks];
      tracks[trackIndex] = { ...tracks[trackIndex], [key]: value };
      return { ...prev, tracks };
    });
  };

  const submitMeditation = () => {
    if (!meditationForm.title.trim() || !meditationForm.description.trim()) {
      toast.error("Meditation title and description are required");
      return;
    }
    if (!meditationForm.emoji) {
      toast.error("Emoji image is required");
      return;
    }

    const payload = new FormData();
    payload.append("title", meditationForm.title.trim());
    payload.append("description", meditationForm.description.trim());
    payload.append("category", meditationForm.category.trim());
    payload.append("duration", meditationForm.duration.trim() || "0");
    payload.append("benefits", JSON.stringify(toArray(meditationForm.benefits)));
    payload.append(
      "recommendationTags",
      JSON.stringify(toArray(meditationForm.recommendationTags)),
    );
    payload.append("emoji", meditationForm.emoji);
    if (meditationForm.audio) {
      payload.append("audio", meditationForm.audio);
    }

    createMeditationMutation.mutate(payload);
  };

  const submitPlaylist = () => {
    if (!playlistForm.name.trim() || !playlistForm.meditationId) {
      toast.error("Playlist name and meditation are required");
      return;
    }

    const normalizedTracks = playlistForm.tracks.map((track) => ({
      title: track.title.trim(),
      artist: track.artist.trim(),
      duration: track.duration.trim(),
      audio: track.audio,
      thumbnail: track.thumbnail,
    }));

    if (
      normalizedTracks.some(
        (track) => !track.title || !track.duration || !track.audio,
      )
    ) {
      toast.error("Each track needs title, duration and audio file");
      return;
    }

    const payload = new FormData();
    payload.append("name", playlistForm.name.trim());
    payload.append("meditationId", playlistForm.meditationId);
    payload.append("category", playlistForm.category.trim());
    payload.append("description", playlistForm.description.trim());
    if (playlistForm.playlistIcon) {
      payload.append("playlistIcon", playlistForm.playlistIcon);
    }

    payload.append(
      "tracks",
      JSON.stringify(
        normalizedTracks.map((track) => ({
          title: track.title,
          artist: track.artist,
          duration: track.duration,
        })),
      ),
    );

    normalizedTracks.forEach((track) => {
      if (track.audio) payload.append("audio", track.audio);
      if (track.thumbnail) payload.append("thumbnail", track.thumbnail);
    });

    createPlaylistMutation.mutate(payload);
  };

  return (
    <div className="fade-up space-y-5">
      <PageHeader
        title={activeTab === "meditate" ? "Create New Meditate" : "Add New Playlist"}
        subtitle={
          activeTab === "meditate"
            ? "Create meditation cards with emotion icon and optional audio"
            : "Attach tracks and category icon for each meditation playlist"
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "meditate" ? "default" : "secondary"}
              className="gap-2"
              onClick={() => setActiveTab("meditate")}
            >
              <PlusCircle className="h-4 w-4" />
              New Meditate
            </Button>
            <Button
              variant={activeTab === "playlist" ? "default" : "secondary"}
              className="gap-2"
              onClick={() => setActiveTab("playlist")}
            >
              <PlusCircle className="h-4 w-4" />
              Add New Playlist
            </Button>
          </div>
        }
      />

      {activeTab === "meditate" ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Meditation title</Label>
              <Input
                value={meditationForm.title}
                onChange={(event) => setMeditationField("title", event.target.value)}
                placeholder="Anxiety Release"
              />
            </div>
            <div className="space-y-2">
              <Label>Emotion description</Label>
              <Textarea
                className="min-h-[90px]"
                value={meditationForm.description}
                onChange={(event) => setMeditationField("description", event.target.value)}
                placeholder="Calms the mind and reduces stress"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={meditationForm.category}
                  onChange={(event) => setMeditationField("category", event.target.value)}
                  placeholder="General"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={meditationForm.duration}
                  onChange={(event) => setMeditationField("duration", event.target.value)}
                  placeholder="15"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Benefits (comma separated)</Label>
                <Input
                  value={meditationForm.benefits}
                  onChange={(event) => setMeditationField("benefits", event.target.value)}
                  placeholder="Better sleep, Lower anxiety"
                />
              </div>
              <div className="space-y-2">
                <Label>Recommendation tags</Label>
                <Input
                  value={meditationForm.recommendationTags}
                  onChange={(event) => setMeditationField("recommendationTags", event.target.value)}
                  placeholder="stress, anger"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Upload the emoji</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setMeditationField("emoji", event.target.files?.[0] || null)}
                />
                {meditationEmojiPreview ? (
                  <Image
                    src={meditationEmojiPreview}
                    alt="Emoji preview"
                    width={92}
                    height={92}
                    className="h-[92px] w-[92px] rounded-md border border-app-border object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Upload audio (optional)</Label>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(event) => setMeditationField("audio", event.target.files?.[0] || null)}
                />
                <p className="text-xs text-app-muted">
                  <UploadCloud className="mr-1 inline h-3 w-3" />
                  MP3/WAV up to 10MB
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Button onClick={submitMeditation} fullWidth disabled={createMeditationMutation.isPending}>
                {createMeditationMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setMeditationForm(defaultMeditationForm)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "playlist" ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Playlist name</Label>
                <Input
                  value={playlistForm.name}
                  onChange={(event) => setPlaylistField("name", event.target.value)}
                  placeholder="Nature Sound"
                />
              </div>
              <div className="space-y-2">
                <Label>Meditation</Label>
                <select
                  value={playlistForm.meditationId}
                  onChange={(event) => setPlaylistField("meditationId", event.target.value)}
                  className="flex h-11 w-full rounded-md border border-app-border bg-white px-3 text-sm text-app-heading focus:outline-none focus:ring-2 focus:ring-app-primary/40"
                >
                  <option value="">Select meditation</option>
                  {(meditations ?? []).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={playlistForm.category}
                  onChange={(event) => setPlaylistField("category", event.target.value)}
                  placeholder="General"
                />
              </div>
              <div className="space-y-2">
                <Label>Playlist icon</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPlaylistField("playlistIcon", event.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                className="min-h-[80px]"
                value={playlistForm.description}
                onChange={(event) => setPlaylistField("description", event.target.value)}
                placeholder="Playlist description"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tracks</Label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setPlaylistForm((prev) => ({ ...prev, tracks: [...prev.tracks, createEmptyTrack()] }))
                  }
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Track
                </Button>
              </div>

              {playlistForm.tracks.map((track, trackIndex) => (
                <div
                  key={trackIndex}
                  className="grid gap-3 rounded-md border border-app-border p-3 md:grid-cols-2 xl:grid-cols-5"
                >
                  <Input
                    placeholder="Track title"
                    value={track.title}
                    onChange={(event) => updateTrack(trackIndex, "title", event.target.value)}
                  />
                  <Input
                    placeholder="Artist"
                    value={track.artist}
                    onChange={(event) => updateTrack(trackIndex, "artist", event.target.value)}
                  />
                  <Input
                    placeholder="Duration (04:34)"
                    value={track.duration}
                    onChange={(event) => updateTrack(trackIndex, "duration", event.target.value)}
                  />
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(event) => updateTrack(trackIndex, "audio", event.target.files?.[0] || null)}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      updateTrack(trackIndex, "thumbnail", event.target.files?.[0] || null)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Button onClick={submitPlaylist} fullWidth disabled={createPlaylistMutation.isPending}>
                {createPlaylistMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                fullWidth
                onClick={() => setPlaylistForm(defaultPlaylistForm)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-app-heading">Meditation Library</h2>
        {meditationsQuery.isLoading ? <CardsSkeleton count={4} /> : null}
        {!meditationsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {paginatedMeditations.map((item) => (
              <Card key={item._id}>
                <CardContent className="space-y-2 pt-5">
                  <div className="flex items-center gap-2">
                    {item.emoji?.url ? (
                      <Image
                        src={item.emoji.url}
                        alt={item.title}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-md object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="font-semibold text-app-heading">{item.title}</p>
                      <p className="text-xs text-app-muted">{item.category}</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-app-body">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
        <PaginationBar page={meditationPage} totalPages={meditationPages} onPageChange={setMeditationPage} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-app-heading">Most Played Music</h2>
        {playlistsQuery.isLoading ? <CardsSkeleton count={4} /> : null}
        {!playlistsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedPlaylists.map((playlist) => (
              <Card key={playlist._id}>
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-app-heading">{playlist.name}</p>
                      <p className="text-xs text-app-muted">
                        {playlist.trackCount} tracks - {playlist.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm("Delete this playlist?")) return;
                        deletePlaylistMutation.mutate(playlist._id);
                      }}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 rounded-md border border-app-border p-2">
                    {playlist.tracks.slice(0, 3).map((track) => (
                      <div key={track._id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {track.thumbnailUrl ? (
                            <Image
                              src={track.thumbnailUrl}
                              alt={track.title}
                              width={52}
                              height={34}
                              className="h-9 w-14 rounded-sm object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-14 items-center justify-center rounded-sm bg-app-soft">
                              <FolderOpen className="h-4 w-4 text-app-muted" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-app-heading">{track.title}</p>
                            <p className="text-xs text-app-muted">{track.duration}</p>
                          </div>
                        </div>
                        <p className="text-xs text-app-muted">{track.playCount} plays</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        <PaginationBar page={playlistPage} totalPages={playlistPages} onPageChange={setPlaylistPage} />
      </section>
    </div>
  );
}
