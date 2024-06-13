import math

# Given values
v = 190  # initial velocity in m/s
g = 9.8  # acceleration due to gravity in m/s^2
y = 0  # initial height in meters
k = 0.01  # drag coefficient
x = 3683.6  # horizontal distance in meters

# Calculate the angle in radians
numerator = v**2 + math.sqrt(v**4 - g*(g*x**2 + 2*y*v**2) - k*v**2)
denominator = g * x
theta = math.atan(numerator / denominator)

# Convert the angle to degrees for better understanding
theta_degrees = math.degrees(theta)

print(theta_degrees)
