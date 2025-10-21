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
'Easy', 'Strings');