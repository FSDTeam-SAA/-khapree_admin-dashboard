"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/loading-blocks";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteAdminUser, getAdminUsers, queryKeys } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 8;

export default function UserListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({
    queryKey: queryKeys.users(page, PAGE_SIZE, search),
    queryFn: () => getAdminUsers({ page, limit: PAGE_SIZE, search }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const users = usersQuery.data?.users || [];
  const meta = usersQuery.data?.meta;

  const totalCount = useMemo(() => meta?.total || users.length || 0, [meta?.total, users.length]);
  const currentPage = meta?.page || page;
  const currentLimit = meta?.limit || PAGE_SIZE;
  const startItem = users.length ? (currentPage - 1) * currentLimit + 1 : 0;
  const endItem = users.length ? (currentPage - 1) * currentLimit + users.length : 0;

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    deleteUserMutation.mutate(id);
  };

  return (
    <div className="fade-up">
      <PageHeader
        title="User List"
        subtitle="Manage all registered users"
        actions={
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or email"
                className="pl-9"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        }
      />

      {usersQuery.isLoading ? <TableSkeleton rows={8} /> : null}

      {!usersQuery.isLoading ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Payable</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length ? (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar?.url}
                            name={user.name}
                            className="h-11 w-11 border border-app-border"
                          />
                          <span className="font-medium text-app-heading">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>$ {user.subscription?.plan?.priceMonthly ?? 0}</TableCell>
                      <TableCell>{user.currentPlan || user.subscription?.plan?.name || "Free"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDelete(user._id)}
                            disabled={deleteUserMutation.isPending}
                            className="gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                          <Badge variant="active">Active</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-app-muted">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="px-4 pb-4 pt-2 text-sm text-app-muted">
              Showing {startItem} to {endItem} of {totalCount} results
            </div>
          </CardContent>
        </Card>
      ) : null}

      <PaginationBar
        page={currentPage}
        totalPages={meta?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
