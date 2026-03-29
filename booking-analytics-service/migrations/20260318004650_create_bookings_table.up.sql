CREATE TABLE bookings (
                          id UUID PRIMARY KEY,
                          room_id UUID NOT NULL,
                          guest_name VARCHAR(100) NOT NULL,
                          start_date DATE NOT NULL,
                          end_date DATE NOT NULL,
                          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);