import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Booking {
  id: string;
  quantity: number;
  total_amount: number;
  booking_status: string;
  booking_date: string;
  events: {
    title: string;
    event_date: string;
    venue: string;
    category: string;
  };
}

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookings();
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      // Error handled silently
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          events (
            title,
            event_date,
            venue,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">TicketHub</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold" data-testid="dashboard-title">My Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name || user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Booking Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Bookings</CardDescription>
                <CardTitle className="text-3xl" data-testid="total-bookings">{bookings.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Spent</CardDescription>
                <CardTitle className="text-3xl">
                  ${bookings.reduce((sum, b) => sum + Number(b.total_amount), 0).toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Bookings</CardDescription>
                <CardTitle className="text-3xl">
                  {bookings.filter(b => b.booking_status === 'confirmed').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">My Bookings</h3>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No bookings yet</p>
                <Button onClick={() => navigate('/events')}>Browse Events</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4" data-testid="bookings-list">
              {bookings.map((booking) => (
                <Card key={booking.id} data-testid="booking-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-2">{booking.events.title}</CardTitle>
                        <Badge variant={booking.booking_status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.booking_status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${Number(booking.total_amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.quantity} ticket(s)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Event: {format(new Date(booking.events.event_date), 'PPP')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {booking.events.venue}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ticket className="h-4 w-4" />
                      Booked: {format(new Date(booking.booking_date), 'PPP')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
