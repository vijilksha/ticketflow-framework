# Supabase Beginner's Guide for TicketHub

## 📚 Table of Contents
1. [What is Supabase?](#what-is-supabase)
2. [Understanding Backend vs Frontend](#understanding-backend-vs-frontend)
3. [How Supabase Works in TicketHub](#how-supabase-works-in-tickethub)
4. [Database Tables Explained](#database-tables-explained)
5. [Authentication System](#authentication-system)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Making Database Queries](#making-database-queries)
8. [Real-World Examples](#real-world-examples)
9. [Common Operations](#common-operations)
10. [Best Practices](#best-practices)

---

## 🎯 What is Supabase?

### Simple Explanation
Imagine you're building a house (your web application):
- **Frontend** (React): This is what you see - the walls, windows, doors, paint
- **Backend** (Supabase): This is what you don't see - the plumbing, electrical, foundation

Supabase is like a pre-built foundation and utility system for your house. Instead of building these yourself, Supabase provides them ready to use!

### What Supabase Provides

**1. Database (PostgreSQL)**
- Stores all your data (users, events, bookings)
- Like a super-organized filing cabinet
- Each piece of data has its own place

**2. Authentication**
- Handles user sign-up and login
- Keeps track of who's logged in
- Manages passwords securely

**3. Real-time Updates**
- Instantly notifies your app when data changes
- Like getting a text message when something happens

**4. Storage**
- Stores files (images, documents)
- Like a cloud hard drive

**5. Edge Functions**
- Runs code on the server
- Handles tasks that shouldn't run on users' devices

---

## 🏗 Understanding Backend vs Frontend

### Frontend (What You See)
```typescript
// This runs in the user's browser
<button onClick={handleBooking}>Book Event</button>
```

**Characteristics:**
- Runs on the user's computer/phone
- Can be inspected by users
- Handles user interface
- Makes requests to the backend

### Backend (What You Don't See)
```typescript
// This runs on a server
await supabase.from('bookings').insert({ user_id, event_id });
```

**Characteristics:**
- Runs on a server (in the cloud)
- Can't be accessed by users directly
- Handles data storage and security
- Responds to frontend requests

### Why We Need Both

**Example: Booking an Event**

1. **Frontend**: User clicks "Book Event" button
2. **Frontend**: Sends request to backend
3. **Backend**: Checks if user is logged in
4. **Backend**: Verifies event has available seats
5. **Backend**: Creates booking in database
6. **Backend**: Sends confirmation back
7. **Frontend**: Shows success message to user

---

## 🔧 How Supabase Works in TicketHub

### Lovable Cloud Integration

In this project, we're using **Lovable Cloud**, which provides Supabase functionality automatically. You don't need to:
- Create a Supabase account separately
- Manually configure databases
- Set up authentication manually

It's all done for you! Think of it like getting a fully furnished apartment instead of an empty one.

### Project Connection

```typescript
// This file is auto-generated - don't edit it!
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
```

**What's Happening:**
1. `createClient`: Creates a connection to your Supabase project
2. `VITE_SUPABASE_URL`: Your project's address (like a website URL)
3. `VITE_SUPABASE_PUBLISHABLE_KEY`: Your public key (like an apartment building's address - everyone can know it)

---

## 📊 Database Tables Explained

Think of tables like spreadsheets - they have columns (fields) and rows (individual records).

### 1. **Users Table** (Built-in by Supabase)

Automatically created when someone signs up:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier (like a social security number) |
| email | Text | User's email address |
| created_at | Timestamp | When they signed up |

**Real-World Analogy:** 
Like a membership card database at a gym - stores basic info about who has access.

### 2. **Profiles Table**

Stores additional user information:

```typescript
// What it looks like
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "550e8400-e29b-41d4-a716-446655440000",
  full_name: "John Doe",
  email: "john@example.com",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z"
}
```

**Why Separate from Users?**
- `users` table is managed by Supabase auth (you can't modify it directly)
- `profiles` table is yours to customize
- Like having a basic membership card (users) and a detailed member profile (profiles)

### 3. **Events Table**

Stores information about events available for booking:

```typescript
{
  id: "660e8400-e29b-41d4-a716-446655440000",
  title: "Rock Concert 2024",
  description: "Amazing live performance",
  event_date: "2024-12-31T20:00:00Z",
  venue: "Madison Square Garden",
  price: 150.00,
  total_seats: 500,
  available_seats: 450,
  category: "Music",
  image_url: "https://example.com/concert.jpg",
  created_at: "2024-01-10T09:00:00Z",
  updated_at: "2024-01-10T09:00:00Z"
}
```

**Real-World Analogy:**
Like a movie theater's schedule board - shows what's playing, when, and how many tickets are left.

### 4. **Bookings Table**

Records when users book events:

```typescript
{
  id: "770e8400-e29b-41d4-a716-446655440000",
  user_id: "550e8400-e29b-41d4-a716-446655440000",
  event_id: "660e8400-e29b-41d4-a716-446655440000",
  quantity: 2,
  total_amount: 300.00,
  booking_status: "confirmed",
  booking_date: "2024-01-15T14:30:00Z",
  created_at: "2024-01-15T14:30:00Z",
  updated_at: "2024-01-15T14:30:00Z"
}
```

**Real-World Analogy:**
Like a receipt or reservation confirmation - connects a person to an event with details about the purchase.

### Table Relationships

```
Users (Built-in)
  └── has many → Profiles (one profile per user)
  └── has many → Bookings (many bookings per user)

Events
  └── has many → Bookings (many bookings per event)
```

**Visual Example:**
```
User: John Doe
  ├── Profile: Full Name, Email
  └── Bookings:
      ├── Booking 1: Rock Concert, 2 tickets
      └── Booking 2: Comedy Show, 1 ticket
```

---

## 🔐 Authentication System

### What is Authentication?

Authentication = Proving who you are
- Like showing ID to enter a club
- Or logging into your email account

### How It Works in TicketHub

#### 1. **Sign Up (Creating an Account)**

```typescript
// src/lib/auth.tsx
const signUp = async (email: string, password: string, fullName: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName  // Extra info saved with account
      }
    }
  });
  
  return { error };
};
```

**What Happens:**
1. User fills out signup form
2. Supabase creates account in `users` table
3. Automatically creates entry in `profiles` table (via database trigger)
4. User is logged in

**Real-World Flow:**
```
User: "I want to sign up"
       ↓
App: "Enter email and password"
       ↓
Supabase: "Creating account..."
       ↓
Supabase: "Account created! You're now logged in"
       ↓
User: "I can now book events!"
```

#### 2. **Sign In (Logging In)**

```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { error };
};
```

**What Happens:**
1. User enters email and password
2. Supabase checks if they match
3. If correct, creates a "session" (logged-in state)
4. Returns session token to the app

**Session = Logged-in State**
- Like getting a wristband at an event
- The wristband proves you paid and can stay
- Session proves you're logged in

#### 3. **Checking Who's Logged In**

```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  console.log('Logged in as:', user.email);
} else {
  console.log('Not logged in');
}
```

#### 4. **Sign Out**

```typescript
const signOut = async () => {
  await supabase.auth.signOut();
};
```

Destroys the session - like returning your event wristband.

---

## 🛡 Row Level Security (RLS)

### What is RLS?

**Simple Explanation:**
RLS = Rules that control who can see and change what data

**Real-World Analogy:**
Think of a hospital:
- You can see YOUR medical records
- Doctors can see their patients' records
- You CAN'T see other people's records

### Why is it Important?

**Without RLS:**
```typescript
// Anyone could see EVERYONE's bookings!
const { data } = await supabase.from('bookings').select('*');
// Returns: ALL bookings from ALL users
```

**With RLS:**
```typescript
// Users only see THEIR OWN bookings
const { data } = await supabase.from('bookings').select('*');
// Returns: Only bookings where user_id matches the logged-in user
```

### RLS Policies in TicketHub

#### 1. **Bookings Table Policies**

```sql
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);
```

**Translation:**
"When someone tries to SELECT (read) from bookings, only show rows where the user_id matches the currently logged-in user's ID"

**Example:**
```
Logged in as: john@example.com (ID: abc123)

Database has:
- Booking 1: user_id = abc123  ✅ John can see this
- Booking 2: user_id = xyz789  ❌ John can't see this
- Booking 3: user_id = abc123  ✅ John can see this
```

#### 2. **Events Table Policies**

```sql
-- Anyone can view events (even if not logged in)
CREATE POLICY "Anyone can view events"
ON events FOR SELECT
USING (true);
```

**Translation:**
"When someone tries to SELECT from events, show all rows to everyone"

**Why?**
Events are public information - like a movie theater's schedule. Everyone should be able to browse events, even before signing up.

#### 3. **Profiles Table Policies**

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### How RLS Protects Data

**Scenario:** Hacker tries to access someone else's bookings

```typescript
// Hacker is logged in as: hacker@evil.com (ID: bad123)
// Tries to get John's bookings (ID: abc123)

const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', 'abc123');  // Trying to get John's bookings

// Result: Empty array [] 
// RLS blocks it! Only returns bookings where user_id = bad123
```

---

## 💻 Making Database Queries

### Basic CRUD Operations

**CRUD = Create, Read, Update, Delete**

#### 1. **Create (Insert)**

```typescript
// Book an event
const { data, error } = await supabase
  .from('bookings')
  .insert({
    user_id: user.id,
    event_id: 'event-123',
    quantity: 2,
    total_amount: 300.00,
    booking_status: 'confirmed'
  });
```

**What Happens:**
1. Creates new row in bookings table
2. RLS checks if user is allowed (must be their own user_id)
3. Returns the created booking or an error

#### 2. **Read (Select)**

```typescript
// Get all events
const { data: events, error } = await supabase
  .from('events')
  .select('*');

// Get specific event
const { data: event, error } = await supabase
  .from('events')
  .select('*')
  .eq('id', 'event-123')
  .single();  // Get one result

// Get events with filtering
const { data: musicEvents, error } = await supabase
  .from('events')
  .select('*')
  .eq('category', 'Music')
  .order('event_date', { ascending: true });
```

#### 3. **Update**

```typescript
// Update booking status
const { data, error } = await supabase
  .from('bookings')
  .update({ booking_status: 'cancelled' })
  .eq('id', 'booking-123');
```

**RLS Protection:**
Only works if the booking belongs to the logged-in user!

#### 4. **Delete**

```typescript
// Delete a booking
const { error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', 'booking-123');
```

### Complex Queries

#### Joining Tables

```typescript
// Get bookings with event details
const { data: bookings, error } = await supabase
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
  .eq('user_id', user.id);

// Result looks like:
// [
//   {
//     id: 'booking-123',
//     quantity: 2,
//     total_amount: 300,
//     events: {
//       title: 'Rock Concert',
//       event_date: '2024-12-31',
//       venue: 'Madison Square Garden',
//       category: 'Music'
//     }
//   }
// ]
```

#### Counting

```typescript
// Count user's total bookings
const { count, error } = await supabase
  .from('bookings')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);

console.log(`You have ${count} bookings`);
```

#### Filtering and Sorting

```typescript
// Get upcoming events, sorted by date
const { data: upcomingEvents, error } = await supabase
  .from('events')
  .select('*')
  .gte('event_date', new Date().toISOString())  // Greater than or equal to now
  .order('event_date', { ascending: true })
  .limit(10);  // Only get 10 results
```

---

## 🌍 Real-World Examples

### Example 1: User Signs Up and Books an Event

**Step by Step:**

```typescript
// 1. User signs up
const { data: authData, error: signUpError } = await supabase.auth.signUp({
  email: 'sarah@example.com',
  password: 'securepassword123',
  options: {
    data: { full_name: 'Sarah Smith' }
  }
});

// What happened in database:
// - Entry created in 'users' table (by Supabase)
// - Entry created in 'profiles' table (by database trigger)

// 2. User browses events
const { data: events, error: eventsError } = await supabase
  .from('events')
  .select('*')
  .eq('category', 'Music');

// User sees list of music events

// 3. User books an event
const selectedEvent = events[0];

const { data: booking, error: bookingError } = await supabase
  .from('bookings')
  .insert({
    user_id: authData.user.id,
    event_id: selectedEvent.id,
    quantity: 2,
    total_amount: selectedEvent.price * 2,
    booking_status: 'confirmed'
  });

// 4. Update available seats
await supabase
  .from('events')
  .update({
    available_seats: selectedEvent.available_seats - 2
  })
  .eq('id', selectedEvent.id);

// 5. User sees confirmation
// "Successfully booked 2 tickets for Rock Concert!"
```

### Example 2: Viewing Dashboard

```typescript
// User goes to dashboard
const user = await supabase.auth.getUser();

// Fetch user's profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Fetch user's bookings with event details
const { data: bookings } = await supabase
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

// Calculate statistics
const totalBookings = bookings.length;
const totalSpent = bookings.reduce((sum, b) => sum + b.total_amount, 0);
const upcomingEvents = bookings.filter(b => 
  new Date(b.events.event_date) > new Date()
).length;

// Display on dashboard:
// "Welcome, Sarah Smith"
// "Total Bookings: 5"
// "Total Spent: $750"
// "Upcoming Events: 3"
```

### Example 3: Cancelling a Booking

```typescript
const cancelBooking = async (bookingId: string) => {
  // 1. Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, events(*)')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return { error: 'Booking not found' };
  }

  // 2. Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ booking_status: 'cancelled' })
    .eq('id', bookingId);

  if (updateError) {
    return { error: 'Failed to cancel booking' };
  }

  // 3. Return seats to available pool
  await supabase
    .from('events')
    .update({
      available_seats: booking.events.available_seats + booking.quantity
    })
    .eq('id', booking.event_id);

  return { success: true };
};
```

---

## 🔄 Common Operations

### Checking if User is Logged In

```typescript
// In any component
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

### Protected Routes

```typescript
// Redirect to login if not authenticated
useEffect(() => {
  if (!user) {
    navigate('/auth');
  }
}, [user, navigate]);
```

### Error Handling

```typescript
const bookEvent = async (eventId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        event_id: eventId,
        quantity: 1,
        total_amount: 100
      });

    if (error) {
      // Database error
      console.error('Database error:', error.message);
      toast.error('Failed to book event. Please try again.');
      return;
    }

    // Success!
    toast.success('Event booked successfully!');
  } catch (error) {
    // Network or other error
    console.error('Unexpected error:', error);
    toast.error('Something went wrong.');
  }
};
```

### Real-time Updates (Advanced)

```typescript
// Listen for new bookings
const subscription = supabase
  .channel('bookings')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'bookings',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('New booking!', payload.new);
      // Update UI automatically
    }
  )
  .subscribe();

// Clean up when component unmounts
return () => {
  subscription.unsubscribe();
};
```

---

## ✅ Best Practices

### 1. **Always Handle Errors**

```typescript
// Bad
const { data } = await supabase.from('events').select('*');

// Good
const { data, error } = await supabase.from('events').select('*');
if (error) {
  console.error('Error:', error);
  toast.error('Failed to load events');
  return;
}
```

### 2. **Use Type Safety**

```typescript
// Define interfaces
interface Event {
  id: string;
  title: string;
  price: number;
  event_date: string;
}

// Use them
const { data: events, error } = await supabase
  .from('events')
  .select('*')
  .returns<Event[]>();
```

### 3. **Check Authentication Before Database Calls**

```typescript
// Good
if (!user) {
  toast.error('Please log in first');
  navigate('/auth');
  return;
}

const { data } = await supabase.from('bookings').select('*');
```

### 4. **Use RLS for Security, Not Frontend Checks**

```typescript
// Bad - Can be bypassed
if (user.id === booking.user_id) {
  await supabase.from('bookings').delete().eq('id', bookingId);
}

// Good - RLS enforces this in database
await supabase.from('bookings').delete().eq('id', bookingId);
// RLS automatically checks if user owns the booking
```

### 5. **Batch Operations When Possible**

```typescript
// Bad - Multiple calls
for (const eventId of eventIds) {
  await supabase.from('bookings').insert({ event_id: eventId, ...});
}

// Good - Single call
await supabase.from('bookings').insert(
  eventIds.map(id => ({ event_id: id, ...}))
);
```

---

## 🔍 Debugging Tips

### 1. **Check if User is Logged In**

```typescript
const checkAuth = async () => {
  const { data } = await supabase.auth.getSession();
  console.log('Session:', data.session);
  console.log('User:', data.session?.user);
};
```

### 2. **Inspect RLS Policies**

If a query returns empty unexpectedly:
```typescript
// Add .explain() to see why
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .explain({ analyze: true });

console.log('Query plan:', data);
```

### 3. **Check Network Tab**

In browser DevTools:
1. Open Network tab
2. Filter by "supabase"
3. Check request/response

### 4. **Common Errors**

**"row-level security policy"**
- You're trying to access data you don't have permission for
- Check if user is logged in
- Verify RLS policies

**"duplicate key value"**
- Trying to insert a record with an ID that already exists
- Remove the `id` field, let Supabase generate it

**"foreign key constraint"**
- Referenced record doesn't exist
- Example: Trying to book event_id that doesn't exist

---

## 📖 Quick Reference

### Authentication
```typescript
// Sign up
await supabase.auth.signUp({ email, password });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Database Queries
```typescript
// SELECT
await supabase.from('table').select('*');

// INSERT
await supabase.from('table').insert({ field: 'value' });

// UPDATE
await supabase.from('table').update({ field: 'value' }).eq('id', 'abc');

// DELETE
await supabase.from('table').delete().eq('id', 'abc');

// JOIN
await supabase.from('table1').select('*, table2(*)');
```

### Filters
```typescript
.eq('column', 'value')        // Equal
.neq('column', 'value')       // Not equal
.gt('column', 100)            // Greater than
.gte('column', 100)           // Greater than or equal
.lt('column', 100)            // Less than
.lte('column', 100)           // Less than or equal
.like('column', '%pattern%')  // Pattern match
.in('column', ['a', 'b'])     // In array
```

---

## 🎓 Learning Path

1. **Week 1: Basics**
   - Understand what Supabase is
   - Learn about tables and relationships
   - Practice simple SELECT queries

2. **Week 2: Authentication**
   - Implement sign up/sign in
   - Understand sessions
   - Learn about protected routes

3. **Week 3: CRUD Operations**
   - Create, read, update, delete
   - Error handling
   - User feedback (toasts)

4. **Week 4: Advanced**
   - Complex queries with joins
   - RLS policies
   - Real-time updates

---

This guide explains everything about how Supabase works in the TicketHub project! Practice with the examples and you'll become comfortable with backend development in no time.

For more help, check out:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
