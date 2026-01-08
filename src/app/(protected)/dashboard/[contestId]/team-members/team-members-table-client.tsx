'use client';

import { useMemo, useState } from 'react';
import { Copy, Download, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Player } from '@/features/contests/types/player';
import { getURL } from '@/utils/get-url';

interface TeamMembersTableClientProps {
  players: Player[];
  salesCounts: Record<string, number>;
  contestId: string;
  contestName: string;
  contestSlug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

export function TeamMembersTableClient({
  players,
  salesCounts,
  contestSlug,
  contestName,
}: TeamMembersTableClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter players based on search
  const filteredPlayers = useMemo(() => {
    if (!searchQuery) return players;

    const query = searchQuery.toLowerCase();
    return players.filter((player) => {
      const name = player.name.toLowerCase();
      const number = player.number?.toString() || '';
      return name.includes(query) || number.includes(query);
    });
  }, [players, searchQuery]);

  const getReferralLink = (player: Player): string => {
    return `${getURL()}/contest/${contestSlug}?ref=${player.slug}`;
  };

  const copyLink = async (player: Player) => {
    const url = getReferralLink(player);
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied',
      description: `Link copied for ${player.name}`,
    });
  };

  const handleRowClick = (player: Player) => {
    copyLink(player);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Number', 'Slug', 'Referral Link', 'Squares Sold'];
    const rows = filteredPlayers.map((player) => {
      const referralLink = getReferralLink(player);
      const salesCount = salesCounts[player.name] || 0;
      return [
        player.name,
        player.number?.toString() || '',
        player.slug,
        referralLink,
        salesCount.toString(),
      ];
    });

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `${slugify(contestName)}-team-members-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Controls Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Export Button */}
        <Button variant="secondary" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Referral Link</TableHead>
              <TableHead>Squares Sold</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                  {searchQuery ? 'No team members match your search.' : 'No team members yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player) => {
                const salesCount = salesCounts[player.name] || 0;
                const referralLink = getReferralLink(player);
                return (
                  <TableRow
                    key={player.slug}
                    className="cursor-pointer border-zinc-800"
                    onClick={() => handleRowClick(player)}
                  >
                    <TableCell className="font-medium text-white">
                      {player.name}
                      {player.number !== undefined && (
                        <span className="ml-2 text-zinc-400">#{player.number}</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-mono text-sm">
                          {truncateUrl(referralLink)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(player)}
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy link</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        {salesCount} {salesCount === 1 ? 'square' : 'squares'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(player)}
                        className="border-zinc-700"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

