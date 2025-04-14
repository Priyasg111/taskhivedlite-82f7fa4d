
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import BadgeIcon from "./user/BadgeIcon";

interface LeaderboardUser {
  id: string;
  username: string;
  badge_level: string;
  verified_tasks: number;
  avg_score: number;
}

const LeaderboardTable = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgeFilter, setBadgeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("verified_tasks");

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('user_profiles')
          .select('id, badge_level, verified_tasks, avg_score')
          .order(sortBy === 'verified_tasks' ? 'verified_tasks' : 'avg_score', { ascending: false })
          .limit(10);
          
        if (badgeFilter !== 'all') {
          query = query.eq('badge_level', badgeFilter);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Anonymize user data for the leaderboard
        const processedData = data.map((user, index) => ({
          id: user.id,
          username: `Worker ${index + 1}`,
          badge_level: user.badge_level,
          verified_tasks: user.verified_tasks,
          avg_score: user.avg_score,
        }));
        
        setUsers(processedData);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboardData();
  }, [badgeFilter, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Worker Leaderboard</h2>
        <div className="flex gap-2">
          <Select value={badgeFilter} onValueChange={setBadgeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by badge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Badges</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verified_tasks">Most Tasks</SelectItem>
              <SelectItem value="avg_score">Highest Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead className="text-right">Tasks</TableHead>
              <TableHead className="text-right">Avg. Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Loading leaderboard...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No workers found with the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <BadgeIcon level={user.badge_level} showLabel={true} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">{user.verified_tasks}</TableCell>
                  <TableCell className="text-right">{user.avg_score.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
