-- Insert sample difficulties
INSERT INTO difficulties (name)
VALUES ('Easy'), ('Medium'), ('Hard')
ON CONFLICT DO NOTHING;

-- Insert sample topics
INSERT INTO topics (name)
VALUES 
    ('Strings'),
    ('Algorithms'),
    ('Data Structures'),
    ('Bit Manipulation'),
    ('Recursion'),
    ('Databases'),
    ('Arrays'),
    ('Brainteaser'),
    ('FOR_TESTING')
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO questions (name, description, difficulty, topic)
VALUES
-- 1
('Two Sum',
'<p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to </em><code>target</code>.</p><p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p><p>You can return the answer in any order.</p><p>&nbsp;</p><p><strong>Example 1:</strong></p><pre><code>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n</code></pre><p><strong>Example 2:</strong></p><pre><code>Input: nums = [3,2,4], target = 6\nOutput: [1,2]\n</code></pre><p><strong>Example 3:</strong></p><pre><code>Input: nums = [3,3], target = 6\nOutput: [0,1]\n</code></pre><p>&nbsp;</p><p><strong>Constraints:</strong></p><ul><li><p><code>2 &lt;= nums.length &lt;= 104</code></p></li><li><p><code>-109 &lt;= nums[i] &lt;= 109</code></p></li><li><p><code>-109 &lt;= target &lt;= 109</code></p></li><li><p><strong>Only one valid answer exists.</strong></p></li></ul><p>&nbsp;</p><p><strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than<code>O(n2)</code>&nbsp;time complexity?</p>',
'Easy', 'Strings');

-- -- 2
-- ('Linked List Cycle Detection',
-- 'Implement a function to detect if a linked list contains a cycle. https://leetcode.com/problems/linked-list-cycle/',
-- 'Easy', 'Data Structures'),

-- -- 3
-- ('Roman to Integer',
-- 'Given a roman numeral, convert it to an integer. https://leetcode.com/problems/roman-to-integer/',
-- 'Easy', 'Algorithms'),

-- -- 4
-- ('Add Binary',
-- 'Given two binary strings a and b, return their sum as a binary string. https://leetcode.com/problems/add-binary/',
-- 'Easy', 'Bit Manipulation'),

-- -- 5
-- ('Fibonacci Number',
-- 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is, F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2), for n > 1. Given n, calculate F(n). https://leetcode.com/problems/fibonacci-number/',
-- 'Easy', 'Recursion'),

-- -- 6
-- ('Implement Stack using Queues',
-- 'Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty). https://leetcode.com/problems/implement-stack-using-queues/',
-- 'Easy', 'Data Structures'),

-- -- 7
-- ('Combine Two Tables',
-- 'Given table Person with the following columns: 1. personId (int) 2. lastName (varchar) 3. firstName (varchar) personId is the primary key. And table Address with the following columns: 1. addressId (int) 2. personId (int) 3. city (varchar) 4. state (varchar) addressId is the primary key. Write a solution to report the first name, last name, city, and state of each person in the Person table. If the address of a personId is not present in the Address table, report null instead. Return the result table in any order. https://leetcode.com/problems/combine-two-tables/',
-- 'Easy', 'Databases'),

-- -- 8
-- ('Repeated DNA Sequences',
-- 'The DNA sequence is composed of a series of nucleotides abbreviated as "A", "C", "G", and "T". For example, "ACGAATTCCG" is a DNA sequence. When studying DNA, it is useful to identify repeated sequences within the DNA. Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule. You may return the answer in any order. https://leetcode.com/problems/repeated-dna-sequences/',
-- 'Medium', 'Bit Manipulation'),

-- -- 9
-- ('Course Schedule',
-- 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. For example, the pair [0, 1], indicates that to take course 0 you have to first take course 1. Return true if you can finish all courses. Otherwise, return false. https://leetcode.com/problems/course-schedule/',
-- 'Medium', 'Data Structures'),

-- -- 10
-- ('LRU Cache Design',
-- 'Design and implement an LRU (Least Recently Used) cache. https://leetcode.com/problems/lru-cache/',
-- 'Medium', 'Data Structures'),

-- -- 11
-- ('Longest Common Subsequence',
-- 'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters. For example, "ace" is a subsequence of "abcde". A common subsequence of two strings is a subsequence that is common to both strings. https://leetcode.com/problems/longest-common-subsequence/',
-- 'Medium', 'Strings'),

-- -- 12
-- ('Rotate Image',
-- 'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). https://leetcode.com/problems/rotate-image/',
-- 'Medium', 'Arrays'),

-- -- 13
-- ('Airplane Seat Assignment Probability',
-- 'n passengers board an airplane with exactly n seats. The first passenger has lost the ticket and picks a seat randomly. But after that, the rest of the passengers will: take their own seat if it is still available, and pick other seats randomly when they find their seat occupied. Return the probability that the nth person gets his own seat. https://leetcode.com/problems/airplane-seat-assignment-probability/',
-- 'Medium', 'Brainteaser'),

-- -- 14
-- ('Validate Binary Search Tree',
-- 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). https://leetcode.com/problems/validate-binary-search-tree/',
-- 'Medium', 'Data Structures'),

-- -- 15
-- ('Sliding Window Maximum',
-- 'You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window. https://leetcode.com/problems/sliding-window-maximum/',
-- 'Hard', 'Arrays'),

-- -- 16
-- ('N-Queen Problem',
-- 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order. Each solution contains a distinct board configuration of the n-queens'' placement, where "Q" and "." both indicate a queen and an empty space, respectively. https://leetcode.com/problems/n-queens/',
-- 'Hard', 'Algorithms'),

-- -- 17
-- ('Serialize and Deserialize a Binary Tree',
-- 'Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment. Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure. https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
-- 'Hard', 'Data Structures'),

-- -- 18
-- ('Wildcard Matching',
-- 'Given an input string (s) and a pattern (p), implement wildcard pattern matching with support for "?" and "*" where: "?" matches any single character, "*" matches any sequence of characters (including the empty sequence). The matching should cover the entire input string (not partial). https://leetcode.com/problems/wildcard-matching/',
-- 'Hard', 'Strings'),

-- -- 19
-- ('Chalkboard XOR Game',
-- 'You are given an array of integers nums representing the numbers written on a chalkboard. Alice and Bob take turns erasing exactly one number from the chalkboard, with Alice starting first. If erasing a number causes the bitwise XOR of all the elements of the chalkboard to become 0, then that player loses. The bitwise XOR of one element is that element itself, and the bitwise XOR of no elements is 0. Also, if any player starts their turn with the bitwise XOR of all the elements of the chalkboard equal to 0, then that player wins. Return true if and only if Alice wins the game, assuming both players play optimally. https://leetcode.com/problems/chalkboard-xor-game/',
-- 'Hard', 'Brainteaser'),

-- -- 20
-- ('Trips and Users',
-- 'Given table Trips: 1. id (int) 2. client_id (int) 3. driver_id (int) 4. city_id (int) 5. status (enum) 6. request_at (date) id is the primary key. The table holds all taxi trips. Each trip has a unique id, while client_id and driver_id are foreign keys to the users_id at the Users table. Status is an ENUM (category) type of ("completed", "cancelled_by_driver", "cancelled_by_client"). And table Users: 1. users_id (int) 2. banned (enum) 3. role (enum) users_id is the primary key (column with unique values) for this table. The table holds all users. Each user has a unique users_id, and role is an ENUM type of ("client", "driver", "partner"). banned is an ENUM (category) type of ("Yes", "No"). The cancellation rate is computed by dividing the number of canceled (by client or driver) requests with unbanned users by the total number of requests with unbanned users on that day. Write a solution to find the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between "2013-10-01" and "2013-10-03". Round Cancellation Rate to two decimal points. Return the result table in any order. https://leetcode.com/problems/trips-and-users/',
-- 'Hard', 'Databases');
