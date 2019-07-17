import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "imports from 'dist' or 'src' subdirectories of core module are forbidden";

  public apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
  }
}

const CORE_MODULE_NAME = 'original-works-core'
const FORBIDDEN_SUBDIRECTORIES = [
  'dist',
  'src',
]

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
  public visitImportDeclaration (node: ts.ImportDeclaration) {
    const specifier = node.moduleSpecifier;

    if (specifier.kind === ts.SyntaxKind.StringLiteral) {
      const modulePath = (specifier as ts.StringLiteral).text

      if (modulePath.startsWith(CORE_MODULE_NAME)) {
        FORBIDDEN_SUBDIRECTORIES.forEach(dir => {
          if (modulePath.startsWith(`${CORE_MODULE_NAME}/${dir}`)) {
            const properName = `${CORE_MODULE_NAME}${modulePath.substring(CORE_MODULE_NAME.length + 1 + dir.length)}`
            const fix = new Lint.Replacement(specifier.getStart() + 1, specifier.getWidth() - 2, properName);

            this.addFailure(this.createFailure(specifier.getStart(), specifier.getWidth(), Rule.FAILURE_STRING, fix));
          }
        })
      }
    }
    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }
}
