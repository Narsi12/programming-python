def two_sum1(arr,target):
    breakpoint()
    seen = {}
    for index, num in enumerate(arr):
        val = target-num
        if val in seen:
            return [seen[val],index]
        else:
            seen[num]=index
    return seen
arr=[1, 8, 4, 5, 87]
target=13
print(two_sum1(arr,target))