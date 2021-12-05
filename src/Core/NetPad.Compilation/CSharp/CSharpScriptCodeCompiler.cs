using System;
using System.IO;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Text;
using NetPad.Runtimes;

namespace NetPad.Compilation.CSharp
{
    public class CSharpScriptCodeCompiler : ICodeCompiler
    {
        public CompilationResult Compile(CompilationInput input)
        {
            var compilation = CreateCompilation(input);

            using var stream = new MemoryStream();
            var result = compilation.Emit(stream);

            stream.Seek(0, SeekOrigin.Begin);
            return new CompilationResult(result.Success, stream.ToArray(), result.Diagnostics);
        }

        private CSharpCompilation CreateCompilation(CompilationInput input)
        {
            // Parse code
            SourceText sourceCode = SourceText.From(input.Code);

            CSharpParseOptions parseOptions = GetParseOptions();
            SyntaxTree parsedSyntaxTree = SyntaxFactory.ParseSyntaxTree(sourceCode, parseOptions);

            // Build references
            var assemblyLocations = AppDomain.CurrentDomain.GetAssemblies()
                .Where(assembly =>
                    !assembly.IsDynamic &&
                    !string.IsNullOrWhiteSpace(assembly.Location) &&
                    assembly.GetName()?.Name?.StartsWith("System.") == true)
                .Select(assembly => assembly.Location)
                .ToHashSet();

            foreach (var assemblyReferenceLocation in input.AssemblyReferenceLocations)
                assemblyLocations.Add(assemblyReferenceLocation);

            assemblyLocations.Add(typeof(IScriptRuntimeOutputWriter).Assembly.Location);

            var references = assemblyLocations
                .Select(location => MetadataReference.CreateFromFile(location));

            // Create compilation
            var compilationOptions = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
                .WithAssemblyIdentityComparer(DesktopAssemblyIdentityComparer.Default)
                .WithOptimizationLevel(OptimizationLevel.Debug);

            return CSharpCompilation.Create($"NetPadScript_{Guid.NewGuid()}.dll",
                new[] { parsedSyntaxTree },
                references: references,
                options: compilationOptions);
        }

        public CSharpParseOptions GetParseOptions()
        {
            // TODO investigate using SourceKind.Script
            return CSharpParseOptions.Default
                .WithLanguageVersion(LanguageVersion.CSharp9)
                .WithKind(SourceCodeKind.Script);
        }
    }
}
