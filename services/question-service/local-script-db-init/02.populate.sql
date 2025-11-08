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
'<p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to </em><code>target</code>.</p><p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p><p>You can return the answer in any order.</p><p>&nbsp;</p><p><strong>Example 1:</strong></p><pre><code>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n</code></pre><p><strong>Example 2:</strong></p><pre><code>Input: nums = [3,2,4], target = 6\nOutput: [1,2]\n</code></pre><p><strong>Example 3:</strong></p><pre><code>Input: nums = [3,3], target = 6\nOutput: [0,1]\n</code></pre><p>&nbsp;</p><p><strong>Constraints:</strong></p><ul><li><p><code>2 &lt;= nums.length &lt;= 104</code></p></li><li><p><code>-109 &lt;= nums[i] &lt;= 109</code></p></li><li><p><code>-109 &lt;= target &lt;= 109</code></p></li><li><p><strong>Only one valid answer exists.</strong></p></li></ul><p>&nbsp;</p><p><strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than<code>O(n2)</code>&nbsp;time complexity?</p><p></p><img src="https://d3cbqrqvhf2jzt.cloudfront.net/53fddd4331ba44cc89166d53ed2188c3/upload.png"><p></p>',
'Easy', 'Strings'),

-- 2
('Linked List Cycle Detection',
'<p>Implement a function to detect if a linked list contains a cycle.</p><p>Return <code>true</code> if there is a cycle in the linked list, otherwise return <code>false</code>.</p>',
'Easy', 'Data Structures'),

-- 3
('Roman to Integer',
'<p>Given a roman numeral, convert it to an integer.</p><p><strong>Example:</strong></p><pre><code>Input: s = "MCMXCIV"\nOutput: 1994\nExplanation: M = 1000, CM = 900, XC = 90 and IV = 4.\n</code></pre>',
'Easy', 'Algorithms'),

-- 4
('Add Binary',
'<p>Given two binary strings <code>a</code> and <code>b</code>, return their sum as a binary string.</p><p><strong>Example:</strong></p><pre><code>Input: a = "11", b = "1"\nOutput: "100"\n</code></pre>',
'Easy', 'Bit Manipulation'),

-- 5
('Fibonacci Number',
'<p>The Fibonacci numbers, commonly denoted <code>F(n)</code>, form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1:</p><pre><code>F(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2) for n &gt; 1\n</code></pre><p>Given <code>n</code>, calculate <code>F(n)</code>.</p>',
'Easy', 'Recursion'),

-- 6
('Implement Stack using Queues',
'<p>Implement a last-in first-out (LIFO) stack using only two queues. The implemented stack should support the following operations: <code>push</code>, <code>pop</code>, <code>top</code>, and <code>empty</code>.</p>',
'Easy', 'Data Structures'),

-- 7
('Combine Two Tables',
'<p>Given two tables, <strong>Person</strong> and <strong>Address</strong>:</p><ul><li><strong>Person(personId, lastName, firstName)</strong></li><li><strong>Address(addressId, personId, city, state)</strong></li></ul><p>Write a SQL query to report the first name, last name, city, and state of each person. If a person’s address is not present, report <code>null</code> instead.</p>',
'Easy', 'Databases'),

-- 8
('Repeated DNA Sequences',
'<p>Given a string <code>s</code> representing a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in the DNA molecule. You may return the answer in any order.</p><p><strong>Example:</strong></p><pre><code>Input: s = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"\nOutput: ["AAAAACCCCC","CCCCCAAAAA"]\n</code></pre>',
'Medium', 'Algorithms'),

-- 9
('Course Schedule',
'<p>There are <code>numCourses</code> courses labeled from 0 to <code>numCourses - 1</code>. You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a_i, b_i]</code> indicates that you must take course <code>b_i</code> before <code>a_i</code>.</p><p>Return <code>true</code> if you can finish all courses, otherwise return <code>false</code>.</p>',
'Medium', 'Data Structures'),

-- 10
('LRU Cache Design',
'<p>Design and implement an LRU (Least Recently Used) cache.</p><p>Implement the <code>LRUCache</code> class with methods <code>get(key)</code> and <code>put(key, value)</code> that operate in <code>O(1)</code> time complexity.</p>',
'Medium', 'Data Structures'),

-- 11
('Longest Common Subsequence',
'<p>Given two strings <code>text1</code> and <code>text2</code>, return the length of their longest common subsequence. If there is no common subsequence, return 0.</p><p><strong>Example:</strong></p><pre><code>Input: text1 = "abcde", text2 = "ace"\nOutput: 3\nExplanation: The longest common subsequence is "ace".\n</code></pre>',
'Medium', 'Strings'),

-- 12
('Rotate Image',
'<p>You are given an <code>n x n</code> 2D matrix representing an image. Rotate the image by 90 degrees (clockwise).</p><p>You must do this <em>in place</em>.</p>',
'Medium', 'Arrays'),

-- 13
('Airplane Seat Assignment Probability',
'<p><code>n</code> passengers board a plane with exactly <code>n</code> seats. The first passenger picks a seat randomly. Each subsequent passenger takes their own seat if available, otherwise picks a random one.</p><p>Return the probability that the <code>n</code>th person gets their own seat.</p>',
'Medium', 'Brainteaser'),

-- 14
('Validate Binary Search Tree',
'<p>Given the root of a binary tree, determine if it is a valid binary search tree (BST).</p><p>A valid BST is defined as one where the left subtree contains only nodes less than the root, and the right subtree contains only nodes greater than the root.</p>',
'Medium', 'Data Structures'),

-- 15
('Sliding Window Maximum',
'<p>You are given an array of integers <code>nums</code> and an integer <code>k</code>. There is a sliding window of size <code>k</code> moving from left to right. Return the maximum value in each window.</p>',
'Hard', 'Arrays'),

-- 16
('N-Queen Problem',
'<p>The n-queens puzzle is the problem of placing <code>n</code> queens on an <code>n x n</code> chessboard such that no two queens attack each other.</p><p>Return all distinct solutions. Each solution contains a distinct board configuration where <code>"Q"</code> and <code>"."</code> indicate a queen and an empty space respectively.</p>',
'Hard', 'Algorithms'),

-- 17
('Serialize and Deserialize a Binary Tree',
'<p>Design an algorithm to serialize and deserialize a binary tree. Serialization converts a data structure into a string so it can be stored or transmitted, and deserialization reconstructs it back into the original structure.</p>',
'Hard', 'Data Structures'),

-- 18
('Wildcard Matching',
'<p>Given an input string <code>s</code> and a pattern <code>p</code>, implement wildcard pattern matching with support for <code>?</code> and <code>*</code> where:</p><ul><li><code>?</code> matches any single character</li><li><code>*</code> matches any sequence of characters (including the empty sequence)</li></ul><p>The matching should cover the entire input string.</p>',
'Hard', 'Strings'),

-- 19
('Chalkboard XOR Game',
'<p>You are given an array of integers <code>nums</code> representing numbers on a chalkboard. Alice and Bob take turns erasing exactly one number. If erasing a number causes the XOR of all remaining elements to become 0, that player loses.</p><p>Return <code>true</code> if and only if Alice wins the game, assuming both play optimally.</p>',
'Hard', 'Brainteaser'),

-- 20
('Trips and Users',
'<p>Given two tables, <strong>Trips</strong> and <strong>Users</strong>, compute the cancellation rate of requests with unbanned users for each day between <code>2013-10-01</code> and <code>2013-10-03</code>.</p><p>The cancellation rate is the number of canceled (by client or driver) requests divided by the total number of requests with unbanned users. Round the result to two decimal points.</p>',
'Hard', 'Databases');
