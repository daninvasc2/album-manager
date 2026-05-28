---
inclusion: always
---

# Behavioral Guidelines - Practical Examples

These examples illustrate the 4 behavioral principles from the global rules. Reference them when making decisions.

---

## 1. Think Before Coding

### Hidden Assumptions

User Request: "Add a feature to export user data"

❌ Wrong — silently assumes scope, format, fields, file location.

✅ Correct — surface assumptions before implementing:
```
Before implementing, I need to clarify:
1. Scope: Export all users or filtered subset? (privacy implications)
2. Format: Download in browser? Background job? API endpoint?
3. Fields: Which user fields? (some might be sensitive)
4. Volume: How many users typically? (affects approach)
```

### Multiple Interpretations

User Request: "Make the search faster"

❌ Wrong — picks one interpretation silently and over-engineers.

✅ Correct — present options:
```
"Make the search faster" could mean:
1. Faster response time → Add indexes, cache frequent queries
2. Handle more concurrent searches → Async, connection pooling
3. Faster perceived speed (UX) → Partial results, progressive loading

Which aspect matters most for your use case?
```

---

## 2. Simplicity First

### Over-abstraction

User Request: "Add a function to calculate discount"

❌ Wrong — Strategy pattern, ABC, Protocol, dataclass, config (60+ lines for a single calculation).

✅ Correct — solve today's problem:
```python
def calculate_discount(amount: float, percent: float) -> float:
    """Calculate discount amount. percent should be 0-100."""
    return amount * (percent / 100)
```

Add complexity only when you actually need multiple discount types.

### Speculative Features

User Request: "Save user preferences to database"

❌ Wrong — adds caching, validation, merging, notifications nobody asked for.

✅ Correct — just what was asked:
```python
def save_preferences(db, user_id: int, preferences: dict):
    """Save user preferences to database."""
    db.execute(
        "UPDATE users SET preferences = ? WHERE id = ?",
        (json.dumps(preferences), user_id)
    )
```

Add caching/validation/merging later when the need emerges.

---

## 3. Surgical Changes

### Drive-by Refactoring

User Request: "Fix the bug where empty emails crash the validator"

❌ Wrong — also "improves" email regex, adds username validation, changes comments, adds docstring.

✅ Correct — only fix the empty email handling:
```diff
  def validate_user(user_data):
      # Check email format
-     if not user_data.get('email'):
+     email = user_data.get('email', '')
+     if not email or not email.strip():
          raise ValueError("Email required")

      # Basic email validation
-     if '@' not in user_data['email']:
+     if '@' not in email:
          raise ValueError("Invalid email")

      # Check username (UNTOUCHED)
      if not user_data.get('username'):
          raise ValueError("Username required")
      return True
```

### Style Drift

User Request: "Add logging to the upload function"

❌ Wrong — changes quote style, adds type hints, adds docstring, reformats whitespace.

✅ Correct — match existing style, only add logging:
```diff
+ import logging
+ logger = logging.getLogger(__name__)
+
  def upload_file(file_path, destination):
+     logger.info(f'Starting upload: {file_path}')
      try:
          with open(file_path, 'rb') as f:
              data = f.read()
          response = requests.post(destination, files={'file': data})
          if response.status_code == 200:
+             logger.info(f'Upload successful: {file_path}')
              return True
          else:
+             logger.error(f'Upload failed: {file_path}, status={response.status_code}')
              return False
      except Exception as e:
-         print(f"Error: {e}")
+         logger.exception(f'Upload error: {file_path}')
          return False
```

Matched: Single quotes, no type hints, existing boolean pattern, spacing style.

---

## 4. Goal-Driven Execution

### Vague vs. Verifiable

User Request: "Fix the authentication system"

❌ Wrong:
```
I'll fix the authentication system by:
1. Reviewing the code
2. Identifying issues
3. Making improvements
```

✅ Correct — define verifiable success criteria:
```
What specific issue are we solving?

If "users stay logged in after password change":
1. Write test: Change password → verify old session invalidated
   Verify: Test fails (reproduces bug)
2. Implement: Invalidate sessions on password change
   Verify: Test passes
3. No regression: Existing auth tests still pass
   Verify: Full test suite green
```

### Test-First Verification

User Request: "The sorting breaks when there are duplicate scores"

❌ Wrong — immediately changes sort logic without confirming the bug.

✅ Correct — reproduce first, then fix:
```python
# 1. Write a test that reproduces the issue
def test_sort_with_duplicate_scores():
    scores = [
        {'name': 'Alice', 'score': 100},
        {'name': 'Bob', 'score': 100},
        {'name': 'Charlie', 'score': 90},
    ]
    result = sort_scores(scores)
    assert result[0]['score'] == 100
    assert result[1]['score'] == 100
    assert result[2]['score'] == 90
# Verify: Run test → fails with inconsistent ordering

# 2. Now fix with stable sort
def sort_scores(scores):
    """Sort by score descending, then name ascending for ties."""
    return sorted(scores, key=lambda x: (-x['score'], x['name']))
# Verify: Test passes consistently
```

---

## Anti-Patterns Summary

| Principle | Anti-Pattern | Fix |
|-----------|-------------|-----|
| Think Before Coding | Silently assumes format, fields, scope | List assumptions, ask for clarification |
| Simplicity First | Strategy pattern for single calculation | One function until complexity is needed |
| Surgical Changes | Reformats quotes, adds type hints while fixing bug | Only change lines that fix the reported issue |
| Goal-Driven | "I'll review and improve the code" | "Write test for bug X → make it pass → verify" |

---

## Key Insight

The "overcomplicated" examples aren't obviously wrong — they follow design patterns and best practices. The problem is **timing**: they add complexity before it's needed, which:
- Makes code harder to understand
- Introduces more bugs
- Takes longer to implement
- Is harder to test

Good code solves today's problem simply, not tomorrow's problem prematurely.
