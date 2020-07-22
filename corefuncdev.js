let activeTree = {
    "roots": {
        "trunk": {
            "branches": {"some":"val"}
        }
    }
}
//console.log("or", activeTree)
treePath = ['roots', 'trunk', 'branches', "some"]

function range(start, end) {
    yield start;
    if (start === end) return;
    yield range(start + 1, end);
}

for (let i of range(0, treePath.length)) {
    console.log(i)
}

function deleteBranch(tree, treePath) {
for(t in treePath.length) {
    console.log(t)
}
//return deleteBranch(tree)
}

deleteBranch(null,treePath)
// if (treePath.length == 1) {
//     delete activeTree[treePath[0]]
//     console.log(JSON.stringify(activeTree, null, 2))
//     }
//     if (treePath.length == 2) {
//     delete activeTree[treePath[0]][treePath[1]]
//     console.log(JSON.stringify(activeTree, null, 2))
//     }
//     if (treePath.length == 3) {
//     delete activeTree[treePath[0]][treePath[1]][treePath[2]]
//     console.log(JSON.stringify(activeTree, null, 2))
//     }
//     else {
//         console.log("bup")
//     }

